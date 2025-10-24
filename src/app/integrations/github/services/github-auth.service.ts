import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, timer } from 'rxjs';
import { catchError, tap, map, switchMap, takeUntil, filter } from 'rxjs/operators';

import { GitHubConnectionState, GitHubUserInfo } from '../models/github-interfaces';
import { GitHubStateService } from './github-state.service';

@Injectable({
    providedIn: 'root'
})
export class GitHubAuthService {
    private readonly API_BASE_URL = '/api/github'; // This will be configured based on backend
    private readonly TOKEN_REFRESH_INTERVAL = 15 * 60 * 1000; // 15 minutes
    private readonly TOKEN_EXPIRY_BUFFER = 5 * 60 * 1000; // 5 minutes buffer before expiry

    private authenticationState$ = new BehaviorSubject<GitHubConnectionState>({
        isConnected: false,
        userInfo: null,
        connectionDate: null
    });

    private isLoading$ = new BehaviorSubject<boolean>(false);
    private tokenRefreshTimer$ = new BehaviorSubject<boolean>(false);
    private destroy$ = new BehaviorSubject<boolean>(false);

    constructor(
        private http: HttpClient,
        private stateService: GitHubStateService
    ) {
        this.initializeAuthState();
        this.setupTokenRefreshTimer();
    }

    /**
     * Get the current authentication state as an observable
     */
    getAuthenticationState(): Observable<GitHubConnectionState> {
        return this.authenticationState$.asObservable();
    }

    /**
     * Get the current loading state as an observable
     */
    getLoadingState(): Observable<boolean> {
        return this.isLoading$.asObservable();
    }

    /**
     * Get current authentication state synchronously
     */
    getCurrentAuthState(): GitHubConnectionState {
        return this.authenticationState$.value;
    }

    /**
     * Check if user is currently authenticated
     */
    isAuthenticated(): boolean {
        return this.authenticationState$.value.isConnected;
    }

    /**
     * Get current user info if authenticated
     */
    getCurrentUser(): GitHubUserInfo | null {
        return this.authenticationState$.value.userInfo;
    }

    /**
     * Initiate OAuth2 flow with GitHub
     */
    initiateOAuth2Flow(): Observable<any> {
        this.setLoadingState(true);

        return this.http.post(`${this.API_BASE_URL}/auth/initiate`, {})
            .pipe(
                tap((response: any) => {
                    // Handle OAuth2 initiation response
                    // This might include redirecting to GitHub OAuth2 URL
                    if (response.authUrl) {
                        window.location.href = response.authUrl;
                    }
                    this.setLoadingState(false);
                }),
                catchError((error) => {
                    this.setLoadingState(false);
                    return this.handleError(error);
                })
            );
    }

    /**
     * Check current connection status with backend
     */
    checkConnectionStatus(): Observable<GitHubConnectionState> {
        this.setLoadingState(true);

        return this.http.get<GitHubConnectionState>(`${this.API_BASE_URL}/auth/status`)
            .pipe(
                tap((connectionState) => {
                    this.updateAuthenticationState(connectionState);
                    this.stateService.saveConnectionState(connectionState);
                    this.setLoadingState(false);
                }),
                catchError((error) => {
                    this.setLoadingState(false);
                    return this.handleError(error);
                })
            );
    }

    /**
     * Remove GitHub integration
     */
    removeIntegration(): Observable<any> {
        this.setLoadingState(true);

        return this.http.delete(`${this.API_BASE_URL}/auth/disconnect`)
            .pipe(
                tap(() => {
                    const disconnectedState: GitHubConnectionState = {
                        isConnected: false,
                        userInfo: null,
                        connectionDate: null
                    };
                    this.updateAuthenticationState(disconnectedState);
                    this.stateService.clearConnectionState();
                    this.stopTokenRefreshTimer();
                    this.setLoadingState(false);
                }),
                catchError((error) => {
                    this.setLoadingState(false);
                    return this.handleError(error);
                })
            );
    }

    /**
     * Re-sync GitHub integration
     */
    resyncIntegration(): Observable<any> {
        this.setLoadingState(true);

        return this.http.post(`${this.API_BASE_URL}/auth/resync`, {})
            .pipe(
                tap((response: any) => {
                    // Update connection state if needed
                    if (response.connectionState) {
                        this.updateAuthenticationState(response.connectionState);
                        this.stateService.saveConnectionState(response.connectionState);
                        this.startTokenRefreshTimer();
                    }
                    this.setLoadingState(false);
                }),
                catchError((error) => {
                    this.setLoadingState(false);
                    return this.handleError(error);
                })
            );
    }

    /**
     * Handle OAuth2 callback (typically called after redirect from GitHub)
     */
    handleOAuth2Callback(code: string, state: string): Observable<GitHubConnectionState> {
        this.setLoadingState(true);

        return this.http.post<GitHubConnectionState>(`${this.API_BASE_URL}/auth/callback`, {
            code,
            state
        }).pipe(
            tap((connectionState) => {
                this.updateAuthenticationState(connectionState);
                this.stateService.saveConnectionState(connectionState);
                if (connectionState.isConnected) {
                    this.startTokenRefreshTimer();
                }
                this.setLoadingState(false);
            }),
            catchError((error) => {
                this.setLoadingState(false);
                return this.handleError(error);
            })
        );
    }

    /**
     * Refresh authentication token
     */
    refreshToken(): Observable<GitHubConnectionState> {
        if (!this.isAuthenticated()) {
            return throwError(() => new Error('Not authenticated'));
        }

        this.setLoadingState(true);

        return this.http.post<GitHubConnectionState>(`${this.API_BASE_URL}/auth/refresh`, {})
            .pipe(
                tap((connectionState) => {
                    this.updateAuthenticationState(connectionState);
                    this.stateService.saveConnectionState(connectionState);
                    this.setLoadingState(false);
                }),
                catchError((error) => {
                    this.setLoadingState(false);
                    // If token refresh fails, clear authentication state
                    if (error.status === 401 || error.status === 403) {
                        this.clearAuthenticationState();
                    }
                    return this.handleError(error);
                })
            );
    }

    /**
     * Clear authentication state and cleanup
     */
    clearAuthenticationState(): void {
        const clearedState: GitHubConnectionState = {
            isConnected: false,
            userInfo: null,
            connectionDate: null
        };

        this.updateAuthenticationState(clearedState);
        this.stateService.clearConnectionState();
        this.stopTokenRefreshTimer();
        this.setLoadingState(false);
    }

    /**
     * Validate current authentication state
     */
    validateAuthenticationState(): Observable<boolean> {
        if (!this.isAuthenticated()) {
            return new Observable<boolean>(observer => {
                observer.next(false);
                observer.complete();
            });
        }

        return this.checkConnectionStatus().pipe(
            map((connectionState) => connectionState.isConnected),
            catchError(() => {
                this.clearAuthenticationState();
                return new Observable<boolean>(observer => {
                    observer.next(false);
                    observer.complete();
                });
            })
        );
    }

    /**
     * Destroy service and cleanup resources
     */
    destroy(): void {
        this.destroy$.next(true);
        this.destroy$.complete();
        this.stopTokenRefreshTimer();
    }

    /**
     * Initialize authentication state from persistent storage
     */
    private initializeAuthState(): void {
        this.stateService.getConnectionState().pipe(
            takeUntil(this.destroy$)
        ).subscribe(connectionState => {
            this.authenticationState$.next(connectionState);

            // Verify connection status with backend if connected
            if (connectionState.isConnected) {
                this.validateAuthenticationState().subscribe({
                    next: (isValid) => {
                        if (isValid) {
                            this.startTokenRefreshTimer();
                        }
                    },
                    error: (error) => {
                        console.warn('Failed to verify connection status:', error);
                        this.clearAuthenticationState();
                    }
                });
            }
        });
    }

    /**
     * Update the authentication state and notify subscribers
     */
    private updateAuthenticationState(connectionState: GitHubConnectionState): void {
        this.authenticationState$.next(connectionState);
    }

    /**
     * Set loading state
     */
    private setLoadingState(isLoading: boolean): void {
        this.isLoading$.next(isLoading);
    }

    /**
     * Setup token refresh timer
     */
    private setupTokenRefreshTimer(): void {
        // Start timer if authenticated
        if (this.isAuthenticated()) {
            this.startTokenRefreshTimer();
        }
    }

    /**
     * Start token refresh timer
     */
    private startTokenRefreshTimer(): void {
        this.stopTokenRefreshTimer(); // Clear any existing timer

        timer(this.TOKEN_REFRESH_INTERVAL, this.TOKEN_REFRESH_INTERVAL)
            .pipe(
                takeUntil(this.destroy$),
                filter(() => this.isAuthenticated()),
                switchMap(() => this.refreshToken())
            )
            .subscribe({
                next: () => {
                    console.log('Token refreshed successfully');
                },
                error: (error) => {
                    console.error('Token refresh failed:', error);
                    this.clearAuthenticationState();
                }
            });

        this.tokenRefreshTimer$.next(true);
    }

    /**
     * Stop token refresh timer
     */
    private stopTokenRefreshTimer(): void {
        this.tokenRefreshTimer$.next(false);
    }

    /**
     * Enhanced initialization with better error handling and state restoration
     */
    private enhanceInitializeAuthState(): void {
        this.stateService.getConnectionState().pipe(
            takeUntil(this.destroy$)
        ).subscribe(connectionState => {
            this.authenticationState$.next(connectionState);

            // Verify connection status with backend if connected
            if (connectionState.isConnected) {
                this.validateAuthenticationState().subscribe({
                    next: (isValid) => {
                        if (isValid) {
                            this.startTokenRefreshTimer();
                        }
                    },
                    error: (error) => {
                        console.warn('Failed to verify connection status:', error);
                        this.clearAuthenticationState();
                    }
                });
            }
        });
    }

    /**
     * Handle HTTP errors
     */
    private handleError = (error: HttpErrorResponse): Observable<never> => {
        let errorMessage = 'An unknown error occurred';

        if (error.error instanceof ErrorEvent) {
            // Client-side error
            errorMessage = `Client Error: ${error.error.message}`;
        } else {
            // Server-side error
            switch (error.status) {
                case 401:
                    errorMessage = 'Authentication failed. Please try connecting again.';
                    break;
                case 403:
                    errorMessage = 'Access denied. Please check your GitHub permissions.';
                    break;
                case 404:
                    errorMessage = 'GitHub integration service not found.';
                    break;
                case 500:
                    errorMessage = 'Server error. Please try again later.';
                    break;
                default:
                    errorMessage = `Server Error: ${error.status} - ${error.message}`;
            }
        }

        console.error('GitHub Auth Service Error:', errorMessage, error);
        return throwError(() => new Error(errorMessage));
    };
}