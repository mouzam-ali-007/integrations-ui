import { Injectable } from '@angular/core';
import { GitHubEntityType, GitHubEntityDataResponse } from '../models/github-interfaces';

/**
 * Cache entry interface
 */
interface CacheEntry<T> {
    data: T;
    timestamp: number;
    expiresAt: number;
}

/**
 * Cache configuration interface
 */
interface CacheConfig {
    defaultTtl: number; // Time to live in milliseconds
    maxEntries: number; // Maximum number of entries to store
    cleanupInterval: number; // How often to clean up expired entries
}

/**
 * GitHub data caching service with advanced cache management
 */
@Injectable({
    providedIn: 'root'
})
export class GitHubCacheService {
    private readonly DEFAULT_CONFIG: CacheConfig = {
        defaultTtl: 5 * 60 * 1000, // 5 minutes
        maxEntries: 100,
        cleanupInterval: 60 * 1000 // 1 minute
    };

    private dataCache = new Map<string, CacheEntry<GitHubEntityDataResponse>>();
    private schemaCache = new Map<GitHubEntityType, CacheEntry<any[]>>();
    private cleanupTimer: any;
    private config: CacheConfig;

    constructor() {
        this.config = { ...this.DEFAULT_CONFIG };
        this.startCleanupTimer();
    }

    /**
     * Get cached data if still valid
     */
    getData(key: string): GitHubEntityDataResponse | null {
        const entry = this.dataCache.get(key);

        if (!entry) {
            return null;
        }

        if (Date.now() > entry.expiresAt) {
            this.dataCache.delete(key);
            return null;
        }

        return entry.data;
    }

    /**
     * Set data in cache with optional TTL
     */
    setData(key: string, data: GitHubEntityDataResponse, ttl?: number): void {
        const now = Date.now();
        const timeToLive = ttl || this.config.defaultTtl;

        const entry: CacheEntry<GitHubEntityDataResponse> = {
            data,
            timestamp: now,
            expiresAt: now + timeToLive
        };

        this.dataCache.set(key, entry);
        this.enforceMaxEntries();
    }

    /**
     * Get cached schema if still valid
     */
    getSchema(entityType: GitHubEntityType): any[] | null {
        const entry = this.schemaCache.get(entityType);

        if (!entry) {
            return null;
        }

        if (Date.now() > entry.expiresAt) {
            this.schemaCache.delete(entityType);
            return null;
        }

        return entry.data;
    }

    /**
     * Set schema in cache with optional TTL
     */
    setSchema(entityType: GitHubEntityType, schema: any[], ttl?: number): void {
        const now = Date.now();
        const timeToLive = ttl || this.config.defaultTtl;

        const entry: CacheEntry<any[]> = {
            data: schema,
            timestamp: now,
            expiresAt: now + timeToLive
        };

        this.schemaCache.set(entityType, entry);
    }

    /**
     * Check if data exists in cache (regardless of expiration)
     */
    hasData(key: string): boolean {
        return this.dataCache.has(key);
    }

    /**
     * Check if schema exists in cache (regardless of expiration)
     */
    hasSchema(entityType: GitHubEntityType): boolean {
        return this.schemaCache.has(entityType);
    }

    /**
     * Get stale data (even if expired) - useful for fallback scenarios
     */
    getStaleData(key: string): GitHubEntityDataResponse | null {
        const entry = this.dataCache.get(key);
        return entry ? entry.data : null;
    }

    /**
     * Get stale schema (even if expired) - useful for fallback scenarios
     */
    getStaleSchema(entityType: GitHubEntityType): any[] | null {
        const entry = this.schemaCache.get(entityType);
        return entry ? entry.data : null;
    }

    /**
     * Remove specific data from cache
     */
    removeData(key: string): boolean {
        return this.dataCache.delete(key);
    }

    /**
     * Remove specific schema from cache
     */
    removeSchema(entityType: GitHubEntityType): boolean {
        return this.schemaCache.delete(entityType);
    }

    /**
     * Clear all cached data
     */
    clearData(): void {
        this.dataCache.clear();
    }

    /**
     * Clear all cached schemas
     */
    clearSchemas(): void {
        this.schemaCache.clear();
    }

    /**
     * Clear all cache entries
     */
    clearAll(): void {
        this.clearData();
        this.clearSchemas();
    }

    /**
     * Get cache statistics
     */
    getStats(): {
        dataEntries: number;
        schemaEntries: number;
        totalMemoryUsage: number;
        expiredEntries: number;
    } {
        const now = Date.now();
        let expiredDataEntries = 0;
        let expiredSchemaEntries = 0;

        // Count expired data entries
        for (const entry of this.dataCache.values()) {
            if (now > entry.expiresAt) {
                expiredDataEntries++;
            }
        }

        // Count expired schema entries
        for (const entry of this.schemaCache.values()) {
            if (now > entry.expiresAt) {
                expiredSchemaEntries++;
            }
        }

        return {
            dataEntries: this.dataCache.size,
            schemaEntries: this.schemaCache.size,
            totalMemoryUsage: this.estimateMemoryUsage(),
            expiredEntries: expiredDataEntries + expiredSchemaEntries
        };
    }

    /**
     * Update cache configuration
     */
    updateConfig(newConfig: Partial<CacheConfig>): void {
        this.config = { ...this.config, ...newConfig };

        // Restart cleanup timer if interval changed
        if (newConfig.cleanupInterval) {
            this.stopCleanupTimer();
            this.startCleanupTimer();
        }

        // Enforce new max entries limit
        this.enforceMaxEntries();
    }

    /**
     * Get current cache configuration
     */
    getConfig(): CacheConfig {
        return { ...this.config };
    }

    /**
     * Manually trigger cache cleanup
     */
    cleanup(): void {
        this.cleanupExpiredEntries();
        this.enforceMaxEntries();
    }

    /**
     * Preload data into cache (useful for prefetching)
     */
    preloadData(key: string, data: GitHubEntityDataResponse, ttl?: number): void {
        this.setData(key, data, ttl);
    }

    /**
     * Preload schema into cache
     */
    preloadSchema(entityType: GitHubEntityType, schema: any[], ttl?: number): void {
        this.setSchema(entityType, schema, ttl);
    }

    /**
     * Private methods
     */

    private startCleanupTimer(): void {
        this.cleanupTimer = setInterval(() => {
            this.cleanupExpiredEntries();
        }, this.config.cleanupInterval);
    }

    private stopCleanupTimer(): void {
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
            this.cleanupTimer = null;
        }
    }

    private cleanupExpiredEntries(): void {
        const now = Date.now();

        // Clean expired data entries
        for (const [key, entry] of this.dataCache.entries()) {
            if (now > entry.expiresAt) {
                this.dataCache.delete(key);
            }
        }

        // Clean expired schema entries
        for (const [key, entry] of this.schemaCache.entries()) {
            if (now > entry.expiresAt) {
                this.schemaCache.delete(key);
            }
        }
    }

    private enforceMaxEntries(): void {
        // Remove oldest entries if we exceed max entries
        if (this.dataCache.size > this.config.maxEntries) {
            const entries = Array.from(this.dataCache.entries());
            entries.sort((a, b) => a[1].timestamp - b[1].timestamp);

            const entriesToRemove = entries.slice(0, this.dataCache.size - this.config.maxEntries);
            entriesToRemove.forEach(([key]) => this.dataCache.delete(key));
        }
    }

    private estimateMemoryUsage(): number {
        let totalSize = 0;

        // Estimate data cache size
        for (const entry of this.dataCache.values()) {
            totalSize += JSON.stringify(entry.data).length;
        }

        // Estimate schema cache size
        for (const entry of this.schemaCache.values()) {
            totalSize += JSON.stringify(entry.data).length;
        }

        return totalSize;
    }

    /**
     * Cleanup on service destruction
     */
    ngOnDestroy(): void {
        this.stopCleanupTimer();
        this.clearAll();
    }
}