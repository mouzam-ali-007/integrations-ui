import { AGGridColumnDef, AGGridColumnType, GitHubEntityType } from './github-interfaces';

/**
 * Column schema definitions for each GitHub entity type
 * These schemas define how data is displayed in AG Grid for different GitHub collections
 */

/**
 * Organizations column schema
 */
export const ORGANIZATIONS_COLUMNS: AGGridColumnDef[] = [
  {
    field: 'avatar_url',
    headerName: 'Avatar',
    sortable: false,
    filter: false,
    resizable: false,
    width: 60,
    minWidth: 60,
    maxWidth: 60,
    cellRenderer: 'avatarRenderer',
    type: AGGridColumnType.AVATAR,
    pinned: 'left'
  },
  {
    field: 'login',
    headerName: 'Organization',
    sortable: true,
    filter: true,
    resizable: true,
    minWidth: 150,
    type: AGGridColumnType.TEXT,
    pinned: 'left'
  },
  {
    field: 'description',
    headerName: 'Description',
    sortable: false,
    filter: true,
    resizable: true,
    minWidth: 200,
    type: AGGridColumnType.TEXT
  },
  {
    field: 'html_url',
    headerName: 'URL',
    sortable: false,
    filter: false,
    resizable: true,
    width: 100,
    cellRenderer: 'urlRenderer',
    type: AGGridColumnType.URL
  },
  {
    field: 'public_repos',
    headerName: 'Public Repos',
    sortable: true,
    filter: 'agNumberColumnFilter',
    resizable: true,
    width: 120,
    type: AGGridColumnType.NUMBER
  },
  {
    field: 'followers',
    headerName: 'Followers',
    sortable: true,
    filter: 'agNumberColumnFilter',
    resizable: true,
    width: 100,
    type: AGGridColumnType.NUMBER
  },
  {
    field: 'following',
    headerName: 'Following',
    sortable: true,
    filter: 'agNumberColumnFilter',
    resizable: true,
    width: 100,
    type: AGGridColumnType.NUMBER
  },
  {
    field: 'created_at',
    headerName: 'Created',
    sortable: true,
    filter: 'agDateColumnFilter',
    resizable: true,
    width: 120,
    cellRenderer: 'dateRenderer',
    type: AGGridColumnType.DATE
  }
];

/**
 * Repositories column schema
 */
export const REPOSITORIES_COLUMNS: AGGridColumnDef[] = [
  {
    field: 'name',
    headerName: 'Repository',
    sortable: true,
    filter: true,
    resizable: true,
    minWidth: 150,
    type: AGGridColumnType.TEXT,
    pinned: 'left'
  },
  {
    field: 'owner.login',
    headerName: 'Owner',
    sortable: true,
    filter: true,
    resizable: true,
    width: 120,
    type: AGGridColumnType.TEXT
  },
  {
    field: 'description',
    headerName: 'Description',
    sortable: false,
    filter: true,
    resizable: true,
    minWidth: 200,
    type: AGGridColumnType.TEXT
  },
  {
    field: 'language',
    headerName: 'Language',
    sortable: true,
    filter: true,
    resizable: true,
    width: 100,
    type: AGGridColumnType.TEXT
  },
  {
    field: 'stargazers_count',
    headerName: 'Stars',
    sortable: true,
    filter: 'agNumberColumnFilter',
    resizable: true,
    width: 80,
    type: AGGridColumnType.NUMBER
  },
  {
    field: 'forks_count',
    headerName: 'Forks',
    sortable: true,
    filter: 'agNumberColumnFilter',
    resizable: true,
    width: 80,
    type: AGGridColumnType.NUMBER
  },
  {
    field: 'open_issues_count',
    headerName: 'Issues',
    sortable: true,
    filter: 'agNumberColumnFilter',
    resizable: true,
    width: 80,
    type: AGGridColumnType.NUMBER
  },
  {
    field: 'private',
    headerName: 'Private',
    sortable: true,
    filter: 'agSetColumnFilter',
    resizable: true,
    width: 80,
    cellRenderer: 'booleanRenderer',
    type: AGGridColumnType.BOOLEAN
  },
  {
    field: 'html_url',
    headerName: 'URL',
    sortable: false,
    filter: false,
    resizable: true,
    width: 100,
    cellRenderer: 'urlRenderer',
    type: AGGridColumnType.URL
  },
  {
    field: 'created_at',
    headerName: 'Created',
    sortable: true,
    filter: 'agDateColumnFilter',
    resizable: true,
    width: 120,
    cellRenderer: 'dateRenderer',
    type: AGGridColumnType.DATE
  },
  {
    field: 'updated_at',
    headerName: 'Updated',
    sortable: true,
    filter: 'agDateColumnFilter',
    resizable: true,
    width: 120,
    cellRenderer: 'dateRenderer',
    type: AGGridColumnType.DATE
  }
];

/**
 * Commits column schema
 */
export const COMMITS_COLUMNS: AGGridColumnDef[] = [
  {
    field: 'sha',
    headerName: 'SHA',
    sortable: false,
    filter: true,
    resizable: true,
    width: 100,
    cellRenderer: 'commitShaRenderer',
    type: AGGridColumnType.TEXT,
    pinned: 'left'
  },
  {
    field: 'commit.message',
    headerName: 'Message',
    sortable: false,
    filter: true,
    resizable: true,
    minWidth: 250,
    type: AGGridColumnType.TEXT
  },
  {
    field: 'commit.author.name',
    headerName: 'Author',
    sortable: true,
    filter: true,
    resizable: true,
    width: 120,
    type: AGGridColumnType.TEXT
  },
  {
    field: 'author.avatar_url',
    headerName: 'Avatar',
    sortable: false,
    filter: false,
    resizable: false,
    width: 60,
    minWidth: 60,
    maxWidth: 60,
    cellRenderer: 'avatarRenderer',
    type: AGGridColumnType.AVATAR
  },
  {
    field: 'commit.author.date',
    headerName: 'Date',
    sortable: true,
    filter: 'agDateColumnFilter',
    resizable: true,
    width: 140,
    cellRenderer: 'dateRenderer',
    type: AGGridColumnType.DATE
  },
  {
    field: 'html_url',
    headerName: 'URL',
    sortable: false,
    filter: false,
    resizable: true,
    width: 100,
    cellRenderer: 'urlRenderer',
    type: AGGridColumnType.URL
  }
];

/**
 * Pull Requests column schema
 */
export const PULL_REQUESTS_COLUMNS: AGGridColumnDef[] = [
  {
    field: 'number',
    headerName: '#',
    sortable: true,
    filter: 'agNumberColumnFilter',
    resizable: true,
    width: 80,
    type: AGGridColumnType.NUMBER,
    pinned: 'left'
  },
  {
    field: 'title',
    headerName: 'Title',
    sortable: false,
    filter: true,
    resizable: true,
    minWidth: 200,
    type: AGGridColumnType.TEXT
  },
  {
    field: 'state',
    headerName: 'State',
    sortable: true,
    filter: 'agSetColumnFilter',
    resizable: true,
    width: 80,
    cellRenderer: 'stateRenderer',
    type: AGGridColumnType.TEXT
  },
  {
    field: 'user.login',
    headerName: 'Author',
    sortable: true,
    filter: true,
    resizable: true,
    width: 120,
    type: AGGridColumnType.TEXT
  },
  {
    field: 'user.avatar_url',
    headerName: 'Avatar',
    sortable: false,
    filter: false,
    resizable: false,
    width: 60,
    minWidth: 60,
    maxWidth: 60,
    cellRenderer: 'avatarRenderer',
    type: AGGridColumnType.AVATAR
  },
  {
    field: 'labels',
    headerName: 'Labels',
    sortable: false,
    filter: false,
    resizable: true,
    width: 150,
    cellRenderer: 'tagsRenderer',
    type: AGGridColumnType.TAGS
  },
  {
    field: 'created_at',
    headerName: 'Created',
    sortable: true,
    filter: 'agDateColumnFilter',
    resizable: true,
    width: 120,
    cellRenderer: 'dateRenderer',
    type: AGGridColumnType.DATE
  },
  {
    field: 'updated_at',
    headerName: 'Updated',
    sortable: true,
    filter: 'agDateColumnFilter',
    resizable: true,
    width: 120,
    cellRenderer: 'dateRenderer',
    type: AGGridColumnType.DATE
  },
  {
    field: 'html_url',
    headerName: 'URL',
    sortable: false,
    filter: false,
    resizable: true,
    width: 100,
    cellRenderer: 'urlRenderer',
    type: AGGridColumnType.URL
  }
];

/**
 * Issues column schema
 */
export const ISSUES_COLUMNS: AGGridColumnDef[] = [
  {
    field: 'number',
    headerName: '#',
    sortable: true,
    filter: 'agNumberColumnFilter',
    resizable: true,
    width: 80,
    type: AGGridColumnType.NUMBER,
    pinned: 'left'
  },
  {
    field: 'title',
    headerName: 'Title',
    sortable: false,
    filter: true,
    resizable: true,
    minWidth: 200,
    type: AGGridColumnType.TEXT
  },
  {
    field: 'state',
    headerName: 'State',
    sortable: true,
    filter: 'agSetColumnFilter',
    resizable: true,
    width: 80,
    cellRenderer: 'stateRenderer',
    type: AGGridColumnType.TEXT
  },
  {
    field: 'user.login',
    headerName: 'Author',
    sortable: true,
    filter: true,
    resizable: true,
    width: 120,
    type: AGGridColumnType.TEXT
  },
  {
    field: 'user.avatar_url',
    headerName: 'Avatar',
    sortable: false,
    filter: false,
    resizable: false,
    width: 60,
    minWidth: 60,
    maxWidth: 60,
    cellRenderer: 'avatarRenderer',
    type: AGGridColumnType.AVATAR
  },
  {
    field: 'assignee.login',
    headerName: 'Assignee',
    sortable: true,
    filter: true,
    resizable: true,
    width: 120,
    type: AGGridColumnType.TEXT
  },
  {
    field: 'labels',
    headerName: 'Labels',
    sortable: false,
    filter: false,
    resizable: true,
    width: 150,
    cellRenderer: 'tagsRenderer',
    type: AGGridColumnType.TAGS
  },
  {
    field: 'comments',
    headerName: 'Comments',
    sortable: true,
    filter: 'agNumberColumnFilter',
    resizable: true,
    width: 100,
    type: AGGridColumnType.NUMBER
  },
  {
    field: 'created_at',
    headerName: 'Created',
    sortable: true,
    filter: 'agDateColumnFilter',
    resizable: true,
    width: 120,
    cellRenderer: 'dateRenderer',
    type: AGGridColumnType.DATE
  },
  {
    field: 'updated_at',
    headerName: 'Updated',
    sortable: true,
    filter: 'agDateColumnFilter',
    resizable: true,
    width: 120,
    cellRenderer: 'dateRenderer',
    type: AGGridColumnType.DATE
  },
  {
    field: 'html_url',
    headerName: 'URL',
    sortable: false,
    filter: false,
    resizable: true,
    width: 100,
    cellRenderer: 'urlRenderer',
    type: AGGridColumnType.URL
  }
];

/**
 * Changelogs column schema
 */
export const CHANGELOGS_COLUMNS: AGGridColumnDef[] = [
  {
    field: 'tag_name',
    headerName: 'Version',
    sortable: true,
    filter: true,
    resizable: true,
    width: 120,
    type: AGGridColumnType.TEXT,
    pinned: 'left'
  },
  {
    field: 'name',
    headerName: 'Release Name',
    sortable: false,
    filter: true,
    resizable: true,
    minWidth: 200,
    type: AGGridColumnType.TEXT
  },
  {
    field: 'prerelease',
    headerName: 'Pre-release',
    sortable: true,
    filter: 'agSetColumnFilter',
    resizable: true,
    width: 100,
    cellRenderer: 'booleanRenderer',
    type: AGGridColumnType.BOOLEAN
  },
  {
    field: 'draft',
    headerName: 'Draft',
    sortable: true,
    filter: 'agSetColumnFilter',
    resizable: true,
    width: 80,
    cellRenderer: 'booleanRenderer',
    type: AGGridColumnType.BOOLEAN
  },
  {
    field: 'author.login',
    headerName: 'Author',
    sortable: true,
    filter: true,
    resizable: true,
    width: 120,
    type: AGGridColumnType.TEXT
  },
  {
    field: 'author.avatar_url',
    headerName: 'Avatar',
    sortable: false,
    filter: false,
    resizable: false,
    width: 60,
    minWidth: 60,
    maxWidth: 60,
    cellRenderer: 'avatarRenderer',
    type: AGGridColumnType.AVATAR
  },
  {
    field: 'published_at',
    headerName: 'Published',
    sortable: true,
    filter: 'agDateColumnFilter',
    resizable: true,
    width: 120,
    cellRenderer: 'dateRenderer',
    type: AGGridColumnType.DATE
  },
  {
    field: 'html_url',
    headerName: 'URL',
    sortable: false,
    filter: false,
    resizable: true,
    width: 100,
    cellRenderer: 'urlRenderer',
    type: AGGridColumnType.URL
  }
];

/**
 * Users column schema
 */
export const USERS_COLUMNS: AGGridColumnDef[] = [
  {
    field: 'avatar_url',
    headerName: 'Avatar',
    sortable: false,
    filter: false,
    resizable: false,
    width: 60,
    minWidth: 60,
    maxWidth: 60,
    cellRenderer: 'avatarRenderer',
    type: AGGridColumnType.AVATAR,
    pinned: 'left'
  },
  {
    field: 'login',
    headerName: 'Username',
    sortable: true,
    filter: true,
    resizable: true,
    minWidth: 120,
    type: AGGridColumnType.TEXT,
    pinned: 'left'
  },
  {
    field: 'name',
    headerName: 'Name',
    sortable: true,
    filter: true,
    resizable: true,
    width: 150,
    type: AGGridColumnType.TEXT
  },
  {
    field: 'bio',
    headerName: 'Bio',
    sortable: false,
    filter: true,
    resizable: true,
    minWidth: 200,
    type: AGGridColumnType.TEXT
  },
  {
    field: 'company',
    headerName: 'Company',
    sortable: true,
    filter: true,
    resizable: true,
    width: 120,
    type: AGGridColumnType.TEXT
  },
  {
    field: 'location',
    headerName: 'Location',
    sortable: true,
    filter: true,
    resizable: true,
    width: 120,
    type: AGGridColumnType.TEXT
  },
  {
    field: 'public_repos',
    headerName: 'Repos',
    sortable: true,
    filter: 'agNumberColumnFilter',
    resizable: true,
    width: 80,
    type: AGGridColumnType.NUMBER
  },
  {
    field: 'followers',
    headerName: 'Followers',
    sortable: true,
    filter: 'agNumberColumnFilter',
    resizable: true,
    width: 100,
    type: AGGridColumnType.NUMBER
  },
  {
    field: 'following',
    headerName: 'Following',
    sortable: true,
    filter: 'agNumberColumnFilter',
    resizable: true,
    width: 100,
    type: AGGridColumnType.NUMBER
  },
  {
    field: 'html_url',
    headerName: 'URL',
    sortable: false,
    filter: false,
    resizable: true,
    width: 100,
    cellRenderer: 'urlRenderer',
    type: AGGridColumnType.URL
  },
  {
    field: 'created_at',
    headerName: 'Joined',
    sortable: true,
    filter: 'agDateColumnFilter',
    resizable: true,
    width: 120,
    cellRenderer: 'dateRenderer',
    type: AGGridColumnType.DATE
  }
];
/**

 * Column schema mapping for all GitHub entity types
 */
export const GITHUB_COLUMN_SCHEMAS: Record<GitHubEntityType, AGGridColumnDef[]> = {
  [GitHubEntityType.ORGANIZATIONS]: ORGANIZATIONS_COLUMNS,
  [GitHubEntityType.REPOSITORIES]: REPOSITORIES_COLUMNS,
  [GitHubEntityType.COMMITS]: COMMITS_COLUMNS,
  [GitHubEntityType.PULL_REQUESTS]: PULL_REQUESTS_COLUMNS,
  [GitHubEntityType.ISSUES]: ISSUES_COLUMNS,
  [GitHubEntityType.CHANGELOGS]: CHANGELOGS_COLUMNS,
  [GitHubEntityType.USERS]: USERS_COLUMNS
};

/**
 * Get column schema for a specific GitHub entity type
 * @param entityType The GitHub entity type
 * @returns Array of AG Grid column definitions
 */
export function getColumnSchemaForEntity(entityType: GitHubEntityType): AGGridColumnDef[] {
  return GITHUB_COLUMN_SCHEMAS[entityType] || [];
}

/**
 * Get responsive column configuration for mobile devices
 * @param entityType The GitHub entity type
 * @returns Array of AG Grid column definitions with mobile-specific settings
 */
export function getMobileColumnSchemaForEntity(entityType: GitHubEntityType): AGGridColumnDef[] {
  const baseColumns = getColumnSchemaForEntity(entityType);
  
  return baseColumns.map(column => ({
    ...column,
    // Hide less important columns on mobile
    hide: column.hide || (
      column.field.includes('avatar_url') ||
      column.field.includes('html_url') ||
      column.field.includes('created_at') ||
      column.field.includes('updated_at')
    ),
    // Reduce column widths for mobile
    width: column.width ? Math.min(column.width, 150) : undefined,
    minWidth: column.minWidth ? Math.min(column.minWidth, 100) : undefined
  }));
}