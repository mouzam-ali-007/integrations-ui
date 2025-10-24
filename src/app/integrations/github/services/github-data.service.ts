import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of, timer } from 'rxjs';
import { catchError, map, retry, retryWhen, delayWhen, take, concatMap } from 'rxjs/operators';

import {
    GitHubEntityType,
    GitHubEntityConfig,
    PaginationParams,
    FilterParams,
    GitHubEntityDataResponse,
    GitHubApiError
} from '../models/github-interfaces';
import { GITHUB_COLUMN_SCHEMAS } from '../models/github-column-schemas';
import { transformEntityData } from '../utils/data-transformation.utils';
import { GitHubCacheService } from './github-cache.service';

@Injectable({
    providedIn: 'root'
})
export class GitHubDataService {
    private readonly API_BASE_URL = '/api/github';
    private readonly MAX_RETRY_ATTEMPTS = 3;
    private readonly RETRY_DELAY_BASE = 1000; // 1 second base delay

    private entityConfigs: Map<GitHubEntityType, GitHubEntityConfig> = new Map([
        [GitHubEntityType.ORGANIZATIONS, {
            type: GitHubEntityType.ORGANIZATIONS,
            displayName: 'Organizations',
            apiEndpoint: '/organizations',
            columns: GITHUB_COLUMN_SCHEMAS[GitHubEntityType.ORGANIZATIONS]
        }],
        [GitHubEntityType.REPOSITORIES, {
            type: GitHubEntityType.REPOSITORIES,
            displayName: 'Repositories',
            apiEndpoint: '/repositories',
            columns: GITHUB_COLUMN_SCHEMAS[GitHubEntityType.REPOSITORIES]
        }],
        [GitHubEntityType.COMMITS, {
            type: GitHubEntityType.COMMITS,
            displayName: 'Commits',
            apiEndpoint: '/commits',
            columns: GITHUB_COLUMN_SCHEMAS[GitHubEntityType.COMMITS]
        }],
        [GitHubEntityType.PULL_REQUESTS, {
            type: GitHubEntityType.PULL_REQUESTS,
            displayName: 'Pull Requests',
            apiEndpoint: '/pull-requests',
            columns: GITHUB_COLUMN_SCHEMAS[GitHubEntityType.PULL_REQUESTS]
        }],
        [GitHubEntityType.ISSUES, {
            type: GitHubEntityType.ISSUES,
            displayName: 'Issues',
            apiEndpoint: '/issues',
            columns: GITHUB_COLUMN_SCHEMAS[GitHubEntityType.ISSUES]
        }],
        [GitHubEntityType.CHANGELOGS, {
            type: GitHubEntityType.CHANGELOGS,
            displayName: 'Changelogs',
            apiEndpoint: '/changelogs',
            columns: GITHUB_COLUMN_SCHEMAS[GitHubEntityType.CHANGELOGS]
        }],
        [GitHubEntityType.USERS, {
            type: GitHubEntityType.USERS,
            displayName: 'Users',
            apiEndpoint: '/users',
            columns: GITHUB_COLUMN_SCHEMAS[GitHubEntityType.USERS]
        }]
    ]);

    constructor(
        private http: HttpClient,
        private cacheService: GitHubCacheService
    ) { }

    /**
     * Get available GitHub entities/collections
     */
    getAvailableEntities(): Observable<GitHubEntityConfig[]> {
        return new Observable(observer => {
            observer.next(Array.from(this.entityConfigs.values()));
            observer.complete();
        });
    }

    /**
     * Get data for a specific GitHub entity with pagination and filtering
     */
    getEntityData(
        entityType: GitHubEntityType,
        pagination: PaginationParams,
        filters: FilterParams = {}
    ): Observable<GitHubEntityDataResponse> {
        const entityConfig = this.entityConfigs.get(entityType);
        if (!entityConfig) {
            return throwError(() => new Error(`Unsupported entity type: ${entityType}`));
        }

        // Create cache key for this request
        const cacheKey = this.createCacheKey(entityType, pagination, filters);

        // Check cache first
        const cachedData = this.cacheService.getData(cacheKey);
        if (cachedData) {
            return of(cachedData);
        }

        let params = new HttpParams()
            .set('page', pagination.page.toString())
            .set('pageSize', pagination.pageSize.toString());

        if (pagination.sortBy) {
            params = params.set('sortBy', pagination.sortBy);
        }
        if (pagination.sortDirection) {
            params = params.set('sortDirection', pagination.sortDirection);
        }

        if (filters.globalSearch) {
            params = params.set('search', filters.globalSearch);
        }

        if (filters.columnFilters) {
            Object.keys(filters.columnFilters).forEach(key => {
                if (filters.columnFilters![key] !== null && filters.columnFilters![key] !== undefined) {
                    params = params.set(`filter_${key}`, filters.columnFilters![key].toString());
                }
            });
        }

        const url = `${this.API_BASE_URL}/data${entityConfig.apiEndpoint}`;

        return this.http.get<any>(url, { params })
            .pipe(
                map(response => this.transformApiResponse(response, entityType)),
                retryWhen(errors => this.createRetryStrategy(errors)),
                map(response => {
                    // Cache the response
                    this.cacheService.setData(cacheKey, response);
                    return response;
                }),
                catchError(error => this.handleErrorWithFallback(error, cacheKey))
            );
    }

    /**
     * Get column schema/definitions for AG Grid based on entity type
     */
    getEntitySchema(entityType: GitHubEntityType): Observable<any[]> {
        // Check cache first
        const cachedSchema = this.cacheService.getSchema(entityType);
        if (cachedSchema) {
            return of(cachedSchema);
        }

        const url = `${this.API_BASE_URL}/schema/${entityType}`;

        return this.http.get<any[]>(url)
            .pipe(
                map(schema => this.transformSchemaToAGGridColumns(schema, entityType)),
                retryWhen(errors => this.createRetryStrategy(errors)),
                map(columns => {
                    // Cache the schema
                    this.cacheService.setSchema(entityType, columns);
                    return columns;
                }),
                catchError((error) => {
                    console.warn('Failed to load schema, using default columns:', error);
                    const defaultColumns = this.getDefaultColumns(entityType);
                    // Cache the default columns as fallback
                    this.cacheService.setSchema(entityType, defaultColumns);
                    return of(defaultColumns);
                })
            );
    }

    /**
     * Transform backend schema to AG Grid column definitions
     */
    private transformSchemaToAGGridColumns(schema: any[], entityType: GitHubEntityType): any[] {
        return schema.map(field => {
            const column: any = {
                headerName: this.formatHeaderName(field.name),
                field: field.name,
                sortable: true,
                filter: true,
                resizable: true
            };

            switch (field.type) {
                case 'date':
                case 'datetime':
                    column.cellRenderer = this.dateRenderer;
                    column.filter = 'agDateColumnFilter';
                    break;
                case 'url':
                    column.cellRenderer = this.urlRenderer;
                    break;
                case 'avatar':
                case 'image':
                    column.cellRenderer = this.avatarRenderer;
                    column.sortable = false;
                    column.filter = false;
                    column.width = 80;
                    break;
                case 'number':
                    column.filter = 'agNumberColumnFilter';
                    column.cellClass = 'number-cell';
                    break;
                case 'boolean':
                    column.cellRenderer = this.booleanRenderer;
                    column.filter = 'agSetColumnFilter';
                    break;
                default:
                    column.filter = 'agTextColumnFilter';
            }

            if (field.name.includes('description') || field.name.includes('message')) {
                column.width = 300;
                column.wrapText = true;
                column.autoHeight = true;
            } else if (field.name.includes('id')) {
                column.width = 100;
            }

            return column;
        });
    }

    /**
     * Get default columns when schema is not available
     */
    private getDefaultColumns(entityType: GitHubEntityType): any[] {
        const commonColumns = [
            { headerName: 'ID', field: 'id', width: 100, sortable: true, filter: 'agNumberColumnFilter' },
            { headerName: 'Name', field: 'name', sortable: true, filter: 'agTextColumnFilter' },
            { headerName: 'Created At', field: 'created_at', cellRenderer: this.dateRenderer, filter: 'agDateColumnFilter' },
            { headerName: 'Updated At', field: 'updated_at', cellRenderer: this.dateRenderer, filter: 'agDateColumnFilter' }
        ];

        switch (entityType) {
            case GitHubEntityType.REPOSITORIES:
                return [
                    ...commonColumns,
                    { headerName: 'Description', field: 'description', width: 300, wrapText: true },
                    { headerName: 'Language', field: 'language', filter: 'agSetColumnFilter' },
                    { headerName: 'Stars', field: 'stargazers_count', filter: 'agNumberColumnFilter' },
                    { headerName: 'Forks', field: 'forks_count', filter: 'agNumberColumnFilter' }
                ];
            case GitHubEntityType.ISSUES:
                return [
                    ...commonColumns,
                    { headerName: 'Title', field: 'title', width: 250 },
                    { headerName: 'State', field: 'state', filter: 'agSetColumnFilter' },
                    { headerName: 'Author', field: 'user.login' }
                ];
            default:
                return commonColumns;
        }
    }

    /**
     * Format field names for display
     */
    private formatHeaderName(fieldName: string): string {
        return fieldName
            .replace(/_/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase());
    }

    /**
     * Custom cell renderers for AG Grid
     */
    private dateRenderer = (params: any) => {
        if (!params.value) return '';
        const date = new Date(params.value);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    };

    private urlRenderer = (params: any) => {
        if (!params.value) return '';
        return `<a href="${params.value}" target="_blank" rel="noopener noreferrer">${params.value}</a>`;
    };

    private avatarRenderer = (params: any) => {
        if (!params.value) return '';
        return `<img src="${params.value}" alt="Avatar" style="width: 32px; height: 32px; border-radius: 50%;">`;
    };

    private booleanRenderer = (params: any) => {
        if (params.value === null || params.value === undefined) return '';
        return params.value ? '✓' : '✗';
    };

    /**
     * Transform API response to standardized format
     */
    private transformApiResponse(response: any, entityType?: GitHubEntityType): GitHubEntityDataResponse {
        let rawData: any[] = [];

        // Handle different response formats from backend
        if (response.data && Array.isArray(response.data)) {
            rawData = response.data;
        } else if (Array.isArray(response)) {
            rawData = response;
        }

        // Apply entity-specific transformations and sanitization
        const transformedData = entityType ?
            transformEntityData(this.sanitizeData(rawData), entityType) :
            this.sanitizeData(rawData);

        if (response.data && Array.isArray(response.data)) {
            return {
                data: transformedData,
                totalCount: response.totalCount || response.total || response.data.length,
                page: response.page || 1,
                pageSize: response.pageSize || response.per_page || response.data.length,
                hasNextPage: response.hasNextPage || response.has_next_page || false,
                hasPreviousPage: response.hasPreviousPage || response.has_previous_page || false
            };
        } else if (Array.isArray(response)) {
            return {
                data: transformedData,
                totalCount: response.length,
                page: 1,
                pageSize: response.length,
                hasNextPage: false,
                hasPreviousPage: false
            };
        } else {
            return {
                data: [],
                totalCount: 0,
                page: 1,
                pageSize: 0,
                hasNextPage: false,
                hasPreviousPage: false
            };
        }
    }

    /**
     * Sanitize and validate data for security
     */
    private sanitizeData(data: any[]): any[] {
        return data.map(item => {
            const sanitized: any = {};

            // Only include safe properties and sanitize strings
            Object.keys(item).forEach(key => {
                const value = item[key];

                if (value === null || value === undefined) {
                    sanitized[key] = value;
                } else if (typeof value === 'string') {
                    // Basic XSS protection - remove script tags and dangerous attributes
                    sanitized[key] = value
                        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                        .replace(/javascript:/gi, '')
                        .replace(/on\w+\s*=/gi, '');
                } else if (typeof value === 'object' && !Array.isArray(value)) {
                    // Recursively sanitize nested objects
                    sanitized[key] = this.sanitizeNestedObject(value);
                } else if (Array.isArray(value)) {
                    // Sanitize arrays
                    sanitized[key] = value.map(v =>
                        typeof v === 'object' ? this.sanitizeNestedObject(v) : v
                    );
                } else {
                    sanitized[key] = value;
                }
            });

            return sanitized;
        });
    }

    /**
     * Sanitize nested objects
     */
    private sanitizeNestedObject(obj: any): any {
        if (!obj || typeof obj !== 'object') return obj;

        const sanitized: any = {};
        Object.keys(obj).forEach(key => {
            const value = obj[key];
            if (typeof value === 'string') {
                sanitized[key] = value
                    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                    .replace(/javascript:/gi, '')
                    .replace(/on\w+\s*=/gi, '');
            } else {
                sanitized[key] = value;
            }
        });
        return sanitized;
    }

    /**
     * Create cache key for request parameters
     */
    private createCacheKey(entityType: GitHubEntityType, pagination: PaginationParams, filters: FilterParams): string {
        const key = {
            entityType,
            page: pagination.page,
            pageSize: pagination.pageSize,
            sortBy: pagination.sortBy,
            sortDirection: pagination.sortDirection,
            globalSearch: filters.globalSearch,
            columnFilters: filters.columnFilters
        };
        return JSON.stringify(key);
    }



    /**
     * Create retry strategy with exponential backoff
     */
    private createRetryStrategy(errors: Observable<any>): Observable<any> {
        return errors.pipe(
            concatMap((error, index) => {
                const retryAttempt = index + 1;

                // Don't retry on certain error types
                if (error.status === 401 || error.status === 403 || error.status === 404) {
                    return throwError(() => error);
                }

                // Stop retrying after max attempts
                if (retryAttempt > this.MAX_RETRY_ATTEMPTS) {
                    return throwError(() => error);
                }

                // Calculate exponential backoff delay
                const delay = this.RETRY_DELAY_BASE * Math.pow(2, retryAttempt - 1);

                console.log(`Retrying request (attempt ${retryAttempt}/${this.MAX_RETRY_ATTEMPTS}) after ${delay}ms delay`);

                return timer(delay);
            }),
            take(this.MAX_RETRY_ATTEMPTS)
        );
    }

    /**
     * Handle errors with fallback to cached data
     */
    private handleErrorWithFallback(error: HttpErrorResponse, cacheKey: string): Observable<GitHubEntityDataResponse> {
        // Try to get stale cached data as fallback
        const staleData = this.cacheService.getStaleData(cacheKey);
        if (staleData) {
            console.warn('Using stale cached data due to API error:', error);
            return of(staleData);
        }

        return this.handleError(error);
    }

    /**
     * Handle HTTP errors
     */
    private handleError = (error: HttpErrorResponse): Observable<never> => {
        let errorMessage = 'An unknown error occurred';

        if (error.error instanceof ErrorEvent) {
            errorMessage = `Client Error: ${error.error.message}`;
        } else {
            switch (error.status) {
                case 401:
                    errorMessage = 'Authentication required. Please connect to GitHub first.';
                    break;
                case 403:
                    errorMessage = 'Access denied. Please check your GitHub permissions.';
                    break;
                case 404:
                    errorMessage = 'Requested data not found.';
                    break;
                case 429:
                    errorMessage = 'Rate limit exceeded. Please try again later.';
                    break;
                case 500:
                    errorMessage = 'Server error. Please try again later.';
                    break;
                default:
                    errorMessage = `Server Error: ${error.status} - ${error.message}`;
            }
        }

        console.error('GitHub Data Service Error:', errorMessage, error);

        const apiError: GitHubApiError = {
            message: errorMessage,
            status: error.status,
            code: error.error?.code,
            details: error.error
        };

        return throwError(() => apiError);
    };

    /**
     * Clear all cached data (useful for logout/disconnect)
     */
    public clearCache(): void {
        this.cacheService.clearAll();
    }

    /**
     * Get cache statistics for debugging
     */
    public getCacheStats(): { dataEntries: number; schemaEntries: number; totalMemoryUsage: number; expiredEntries: number } {
        return this.cacheService.getStats();
    }

    /**
     * Update cache configuration
     */
    public updateCacheConfig(config: { defaultTtl?: number; maxEntries?: number; cleanupInterval?: number }): void {
        this.cacheService.updateConfig(config);
    }

    /**
     * Preload data for better performance
     */
    public preloadEntityData(entityType: GitHubEntityType, pagination: PaginationParams, filters: FilterParams = {}): void {
        const cacheKey = this.createCacheKey(entityType, pagination, filters);

        // Only preload if not already cached
        if (!this.cacheService.hasData(cacheKey)) {
            this.getEntityData(entityType, pagination, filters).subscribe({
                next: () => console.log(`Preloaded data for ${entityType}`),
                error: (error) => console.warn(`Failed to preload data for ${entityType}:`, error)
            });
        }
    }

    /**
     * Preload schema for better performance
     */
    public preloadEntitySchema(entityType: GitHubEntityType): void {
        if (!this.cacheService.hasSchema(entityType)) {
            this.getEntitySchema(entityType).subscribe({
                next: () => console.log(`Preloaded schema for ${entityType}`),
                error: (error) => console.warn(`Failed to preload schema for ${entityType}:`, error)
            });
        }
    }
}