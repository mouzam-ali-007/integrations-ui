import { GitHubEntityType } from '../models/github-interfaces';

/**
 * Data transformation utilities for GitHub API responses
 */

/**
 * Transform GitHub repository data for consistent display
 */
export function transformRepositoryData(repo: any): any {
    return {
        ...repo,
        // Normalize language field
        language: repo.language || 'Unknown',
        // Format description with fallback
        description: repo.description || 'No description available',
        // Ensure numeric fields are numbers
        stargazers_count: Number(repo.stargazers_count) || 0,
        forks_count: Number(repo.forks_count) || 0,
        open_issues_count: Number(repo.open_issues_count) || 0,
        // Format dates consistently
        created_at: formatDate(repo.created_at),
        updated_at: formatDate(repo.updated_at),
        pushed_at: formatDate(repo.pushed_at),
        // Ensure owner information is available
        owner: {
            login: repo.owner?.login || 'Unknown',
            avatar_url: repo.owner?.avatar_url || '',
            html_url: repo.owner?.html_url || ''
        }
    };
}

/**
 * Transform GitHub issue data for consistent display
 */
export function transformIssueData(issue: any): any {
    return {
        ...issue,
        // Ensure title is available
        title: issue.title || 'Untitled Issue',
        // Format state consistently
        state: capitalizeFirst(issue.state || 'unknown'),
        // Ensure numeric fields
        number: Number(issue.number) || 0,
        comments: Number(issue.comments) || 0,
        // Format dates
        created_at: formatDate(issue.created_at),
        updated_at: formatDate(issue.updated_at),
        closed_at: formatDate(issue.closed_at),
        // Transform user information
        user: transformUserData(issue.user),
        assignee: issue.assignee ? transformUserData(issue.assignee) : null,
        assignees: issue.assignees ? issue.assignees.map(transformUserData) : [],
        // Transform labels
        labels: issue.labels ? issue.labels.map(transformLabelData) : []
    };
}

/**
 * Transform GitHub pull request data for consistent display
 */
export function transformPullRequestData(pr: any): any {
    return {
        ...pr,
        // Ensure title is available
        title: pr.title || 'Untitled Pull Request',
        // Format state consistently
        state: capitalizeFirst(pr.state || 'unknown'),
        // Ensure numeric fields
        number: Number(pr.number) || 0,
        comments: Number(pr.comments) || 0,
        review_comments: Number(pr.review_comments) || 0,
        commits: Number(pr.commits) || 0,
        additions: Number(pr.additions) || 0,
        deletions: Number(pr.deletions) || 0,
        changed_files: Number(pr.changed_files) || 0,
        // Format dates
        created_at: formatDate(pr.created_at),
        updated_at: formatDate(pr.updated_at),
        closed_at: formatDate(pr.closed_at),
        merged_at: formatDate(pr.merged_at),
        // Transform user information
        user: transformUserData(pr.user),
        assignee: pr.assignee ? transformUserData(pr.assignee) : null,
        assignees: pr.assignees ? pr.assignees.map(transformUserData) : [],
        // Transform labels
        labels: pr.labels ? pr.labels.map(transformLabelData) : [],
        // Transform head and base information
        head: pr.head ? {
            ref: pr.head.ref || '',
            sha: pr.head.sha || '',
            repo: pr.head.repo ? transformRepositoryData(pr.head.repo) : null
        } : null,
        base: pr.base ? {
            ref: pr.base.ref || '',
            sha: pr.base.sha || '',
            repo: pr.base.repo ? transformRepositoryData(pr.base.repo) : null
        } : null
    };
}

/**
 * Transform GitHub commit data for consistent display
 */
export function transformCommitData(commit: any): any {
    return {
        ...commit,
        // Ensure SHA is available
        sha: commit.sha || '',
        // Transform commit information
        commit: {
            ...commit.commit,
            message: commit.commit?.message || 'No commit message',
            author: {
                name: commit.commit?.author?.name || 'Unknown Author',
                email: commit.commit?.author?.email || '',
                date: formatDate(commit.commit?.author?.date)
            },
            committer: {
                name: commit.commit?.committer?.name || 'Unknown Committer',
                email: commit.commit?.committer?.email || '',
                date: formatDate(commit.commit?.committer?.date)
            }
        },
        // Transform author and committer user information
        author: commit.author ? transformUserData(commit.author) : null,
        committer: commit.committer ? transformUserData(commit.committer) : null,
        // Transform stats
        stats: commit.stats ? {
            total: Number(commit.stats.total) || 0,
            additions: Number(commit.stats.additions) || 0,
            deletions: Number(commit.stats.deletions) || 0
        } : null
    };
}

/**
 * Transform GitHub user data for consistent display
 */
export function transformUserData(user: any): any {
    if (!user) return null;

    return {
        ...user,
        login: user.login || 'unknown',
        avatar_url: user.avatar_url || '',
        html_url: user.html_url || '',
        name: user.name || user.login || 'Unknown User',
        bio: user.bio || '',
        company: user.company || '',
        location: user.location || '',
        email: user.email || '',
        // Ensure numeric fields
        public_repos: Number(user.public_repos) || 0,
        public_gists: Number(user.public_gists) || 0,
        followers: Number(user.followers) || 0,
        following: Number(user.following) || 0,
        // Format dates
        created_at: formatDate(user.created_at),
        updated_at: formatDate(user.updated_at)
    };
}

/**
 * Transform GitHub organization data for consistent display
 */
export function transformOrganizationData(org: any): any {
    return {
        ...org,
        login: org.login || 'unknown',
        avatar_url: org.avatar_url || '',
        html_url: org.html_url || '',
        description: org.description || 'No description available',
        name: org.name || org.login || 'Unknown Organization',
        company: org.company || '',
        location: org.location || '',
        email: org.email || '',
        // Ensure numeric fields
        public_repos: Number(org.public_repos) || 0,
        public_gists: Number(org.public_gists) || 0,
        followers: Number(org.followers) || 0,
        following: Number(org.following) || 0,
        // Format dates
        created_at: formatDate(org.created_at),
        updated_at: formatDate(org.updated_at)
    };
}

/**
 * Transform GitHub release/changelog data for consistent display
 */
export function transformReleaseData(release: any): any {
    return {
        ...release,
        tag_name: release.tag_name || 'unknown',
        name: release.name || release.tag_name || 'Unnamed Release',
        body: release.body || 'No release notes available',
        // Ensure boolean fields
        draft: Boolean(release.draft),
        prerelease: Boolean(release.prerelease),
        // Transform author
        author: release.author ? transformUserData(release.author) : null,
        // Format dates
        created_at: formatDate(release.created_at),
        published_at: formatDate(release.published_at),
        // Transform assets
        assets: release.assets ? release.assets.map(transformAssetData) : []
    };
}

/**
 * Transform GitHub label data for consistent display
 */
export function transformLabelData(label: any): any {
    if (!label) return null;

    return {
        ...label,
        name: label.name || 'unlabeled',
        color: label.color || 'cccccc',
        description: label.description || '',
        // Ensure color has # prefix for CSS
        cssColor: label.color ? `#${label.color.replace('#', '')}` : '#cccccc'
    };
}

/**
 * Transform GitHub asset data for consistent display
 */
export function transformAssetData(asset: any): any {
    return {
        ...asset,
        name: asset.name || 'unknown',
        label: asset.label || asset.name || 'Unknown Asset',
        content_type: asset.content_type || 'application/octet-stream',
        // Ensure numeric fields
        size: Number(asset.size) || 0,
        download_count: Number(asset.download_count) || 0,
        // Format dates
        created_at: formatDate(asset.created_at),
        updated_at: formatDate(asset.updated_at),
        // Transform uploader
        uploader: asset.uploader ? transformUserData(asset.uploader) : null
    };
}

/**
 * Get appropriate transformation function for entity type
 */
export function getTransformationFunction(entityType: GitHubEntityType): (data: any) => any {
    switch (entityType) {
        case GitHubEntityType.REPOSITORIES:
            return transformRepositoryData;
        case GitHubEntityType.ISSUES:
            return transformIssueData;
        case GitHubEntityType.PULL_REQUESTS:
            return transformPullRequestData;
        case GitHubEntityType.COMMITS:
            return transformCommitData;
        case GitHubEntityType.USERS:
            return transformUserData;
        case GitHubEntityType.ORGANIZATIONS:
            return transformOrganizationData;
        case GitHubEntityType.CHANGELOGS:
            return transformReleaseData;
        default:
            return (data: any) => data; // No transformation for unknown types
    }
}

/**
 * Transform array of data based on entity type
 */
export function transformEntityData(data: any[], entityType: GitHubEntityType): any[] {
    const transformFn = getTransformationFunction(entityType);
    return data.map(transformFn);
}

/**
 * Utility functions
 */

/**
 * Format date string consistently
 */
function formatDate(dateString: string | null | undefined): string | null {
    if (!dateString) return null;

    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return null;
        return date.toISOString();
    } catch {
        return null;
    }
}

/**
 * Capitalize first letter of string
 */
function capitalizeFirst(str: string): string {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Format file size in human readable format
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Format number with thousand separators
 */
export function formatNumber(num: number): string {
    return num.toLocaleString();
}

/**
 * Truncate text to specified length with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
}

/**
 * Extract domain from URL
 */
export function extractDomain(url: string): string {
    try {
        const urlObj = new URL(url);
        return urlObj.hostname;
    } catch {
        return url;
    }
}