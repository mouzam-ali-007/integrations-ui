/**
 * Core GitHub user information interface
 */
export interface GitHubUserInfo {
  username: string;
  avatarUrl: string;
  displayName: string;
  profileUrl: string;
}

/**
 * GitHub connection state with optional secure token storage
 */
export interface GitHubConnectionState {
  isConnected: boolean;
  userInfo: GitHubUserInfo | null;
  connectionDate: Date | null;
  accessToken?: string; // Stored securely
}

/**
 * Configuration for GitHub entity types with AG Grid column definitions
 */
export interface GitHubEntityConfig {
  type: GitHubEntityType;
  displayName: string;
  apiEndpoint: string;
  columns: AGGridColumnDef[];
}

/**
 * Pagination parameters for AG Grid server-side integration
 */
export interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

/**
 * Filter parameters for global search and column-specific filtering
 */
export interface FilterParams {
  globalSearch?: string;
  columnFilters?: { [key: string]: any };
}

/**
 * Supported GitHub entity types for data collections
 */
export enum GitHubEntityType {
  ORGANIZATIONS = 'organizations',
  REPOSITORIES = 'repositories',
  COMMITS = 'commits',
  PULL_REQUESTS = 'pull_requests',
  ISSUES = 'issues',
  CHANGELOGS = 'changelogs',
  USERS = 'users'
}

/**
 * Loading operation types for enhanced user feedback
 */
export type LoadingOperation = 'connect' | 'remove' | 'resync' | 'schema' | 'data' | 'callback';

/**
 * Main component state interface for GitHub Integration
 */
export interface GitHubIntegrationState {
  isConnected: boolean;
  isLoading: boolean;
  userInfo: GitHubUserInfo | null;
  connectionDate: Date | null;
  selectedEntity: GitHubEntityType;
  gridData: any[];
  gridColumns: AGGridColumnDef[];
  loadingOperation?: LoadingOperation;
}
/**

 * AG Grid column definition interface for GitHub data
 */
export interface AGGridColumnDef {
  field: string;
  headerName: string;
  sortable?: boolean;
  filter?: boolean | string;
  resizable?: boolean;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  cellRenderer?: string | AGGridCellRenderer;
  cellRendererParams?: any;
  hide?: boolean;
  pinned?: 'left' | 'right' | null;
  type?: AGGridColumnType;
}

/**
 * Custom cell renderer interface for GitHub-specific data types
 */
export interface AGGridCellRenderer {
  component: any;
  params?: any;
}

/**
 * Column types for GitHub-specific data rendering
 */
export enum AGGridColumnType {
  TEXT = 'text',
  NUMBER = 'number',
  DATE = 'date',
  AVATAR = 'avatar',
  URL = 'url',
  BOOLEAN = 'boolean',
  TAGS = 'tags'
}

/**
 * GitHub entity data response interface
 */
export interface GitHubEntityDataResponse {
  data: any[];
  totalCount: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * GitHub API error response interface
 */
export interface GitHubApiError {
  message: string;
  status: number;
  code?: string;
  details?: any;
}