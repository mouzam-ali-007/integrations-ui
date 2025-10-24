import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { GitHubConnectionState, GitHubUserInfo } from '../models/github-interfaces';

@Injectable({
  providedIn: 'root'
})
export class GitHubStateService {
  private readonly STORAGE_KEY = 'github_integration_state';

  private connectionState$ = new BehaviorSubject<GitHubConnectionState>({
    isConnected: false,
    userInfo: null,
    connectionDate: null
  });

  constructor() {
    this.initializeState();
  }

  /**
   * Get the current connection state as an observable
   */
  getConnectionState(): Observable<GitHubConnectionState> {
    return this.connectionState$.asObservable();
  }

  /**
   * Save connection state to persistent storage
   */
  saveConnectionState(connectionState: GitHubConnectionState): void {
    try {
      const stateToStore = {
        ...connectionState,
        // Convert Date to ISO string for storage
        connectionDate: connectionState.connectionDate ?
          connectionState.connectionDate.toISOString() : null,
        // Never store access tokens in localStorage for security
        accessToken: undefined
      };

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(stateToStore));
      this.connectionState$.next(connectionState);
    } catch (error) {
      console.error('Failed to save GitHub connection state:', error);
      // If storage fails, still update the in-memory state
      this.connectionState$.next(connectionState);
    }
  }

  /**
   * Clear connection state from persistent storage
   */
  clearConnectionState(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      const clearedState: GitHubConnectionState = {
        isConnected: false,
        userInfo: null,
        connectionDate: null
      };
      this.connectionState$.next(clearedState);
    } catch (error) {
      console.error('Failed to clear GitHub connection state:', error);
    }
  }

  /**
   * Update user information in the current state
   */
  updateUserInfo(userInfo: GitHubUserInfo): void {
    const currentState = this.connectionState$.value;
    const updatedState: GitHubConnectionState = {
      ...currentState,
      userInfo,
      isConnected: true,
      connectionDate: currentState.connectionDate || new Date()
    };

    this.saveConnectionState(updatedState);
  }

  /**
   * Update connection status
   */
  updateConnectionStatus(isConnected: boolean): void {
    const currentState = this.connectionState$.value;

    if (!isConnected) {
      // If disconnecting, clear all state
      this.clearConnectionState();
    } else {
      // If connecting, update status and set connection date if not already set
      const updatedState: GitHubConnectionState = {
        ...currentState,
        isConnected: true,
        connectionDate: currentState.connectionDate || new Date()
      };

      this.saveConnectionState(updatedState);
    }
  }

  /**
   * Get current connection state synchronously
   */
  getCurrentConnectionState(): GitHubConnectionState {
    return this.connectionState$.value;
  }

  /**
   * Check if currently connected to GitHub
   */
  isConnected(): boolean {
    return this.connectionState$.value.isConnected;
  }

  /**
   * Get current user info if available
   */
  getCurrentUserInfo(): GitHubUserInfo | null {
    return this.connectionState$.value.userInfo;
  }

  /**
   * Initialize state from localStorage on service creation
   */
  private initializeState(): void {
    try {
      const storedState = localStorage.getItem(this.STORAGE_KEY);

      if (storedState) {
        const parsedState = JSON.parse(storedState);

        // Convert ISO string back to Date object
        const connectionState: GitHubConnectionState = {
          ...parsedState,
          connectionDate: parsedState.connectionDate ?
            new Date(parsedState.connectionDate) : null
        };

        // Validate the stored state
        if (this.isValidConnectionState(connectionState)) {
          this.connectionState$.next(connectionState);
        } else {
          console.warn('Invalid stored GitHub connection state, clearing...');
          this.clearConnectionState();
        }
      }
    } catch (error) {
      console.error('Failed to initialize GitHub connection state:', error);
      this.clearConnectionState();
    }
  }

  /**
   * Validate connection state structure with enhanced security checks
   */
  private isValidConnectionState(state: any): boolean {
    if (!state || typeof state !== 'object') {
      return false;
    }

    // Check required properties
    if (typeof state.isConnected !== 'boolean') {
      return false;
    }

    // If connected, validate user info
    if (state.isConnected) {
      if (!state.userInfo || typeof state.userInfo !== 'object') {
        return false;
      }

      const userInfo = state.userInfo;
      if (!userInfo.username || !userInfo.avatarUrl || !userInfo.displayName) {
        return false;
      }

      // Validate URL formats for security
      try {
        new URL(userInfo.avatarUrl);
        if (userInfo.profileUrl) {
          new URL(userInfo.profileUrl);
        }
      } catch {
        console.warn('Invalid URL format in user info');
        return false;
      }

      // Validate username format (basic GitHub username rules)
      if (!/^[a-zA-Z0-9]([a-zA-Z0-9-])*[a-zA-Z0-9]$/.test(userInfo.username) &&
        userInfo.username.length > 39) {
        console.warn('Invalid GitHub username format');
        return false;
      }
    }

    // Ensure no access tokens are stored
    if (state.accessToken) {
      console.warn('Access token found in stored state - removing for security');
      delete state.accessToken;
    }

    return true;
  }

  /**
   * Export current state for debugging or backup purposes
   */
  exportState(): string {
    return JSON.stringify(this.connectionState$.value, null, 2);
  }

  /**
   * Import state from JSON string (for debugging or restoration)
   */
  importState(stateJson: string): boolean {
    try {
      const state = JSON.parse(stateJson);

      if (this.isValidConnectionState(state)) {
        const connectionState: GitHubConnectionState = {
          ...state,
          connectionDate: state.connectionDate ? new Date(state.connectionDate) : null
        };

        this.saveConnectionState(connectionState);
        return true;
      } else {
        console.error('Invalid state format for import');
        return false;
      }
    } catch (error) {
      console.error('Failed to import GitHub connection state:', error);
      return false;
    }
  }

  /**
   * Get connection duration in milliseconds
   */
  getConnectionDuration(): number | null {
    const connectionDate = this.connectionState$.value.connectionDate;
    if (!connectionDate) {
      return null;
    }
    return Date.now() - connectionDate.getTime();
  }

  /**
   * Check if connection is stale (older than specified time)
   */
  isConnectionStale(maxAgeMs: number = 24 * 60 * 60 * 1000): boolean {
    const duration = this.getConnectionDuration();
    return duration !== null && duration > maxAgeMs;
  }

  /**
   * Update connection timestamp to current time
   */
  refreshConnectionTimestamp(): void {
    const currentState = this.connectionState$.value;
    if (currentState.isConnected) {
      const updatedState: GitHubConnectionState = {
        ...currentState,
        connectionDate: new Date()
      };
      this.saveConnectionState(updatedState);
    }
  }

  /**
   * Get state change observable for reactive updates
   */
  onStateChange(): Observable<GitHubConnectionState> {
    return this.connectionState$.asObservable();
  }

  /**
   * Check if localStorage is available and working
   */
  private isStorageAvailable(): boolean {
    try {
      const testKey = '__github_storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }
}