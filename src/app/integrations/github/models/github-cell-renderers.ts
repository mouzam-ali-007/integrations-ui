import { AGGridCellRenderer } from './github-interfaces';

/**
 * Cell renderer parameter interfaces for GitHub-specific data types
 */

/**
 * Avatar cell renderer parameters
 */
export interface AvatarRendererParams {
  value: string; // Avatar URL
  data: any; // Full row data
  username?: string; // Optional username for alt text
}

/**
 * URL cell renderer parameters
 */
export interface UrlRendererParams {
  value: string; // URL
  data: any; // Full row data
  linkText?: string; // Optional custom link text
  openInNewTab?: boolean; // Whether to open in new tab
}

/**
 * Date cell renderer parameters
 */
export interface DateRendererParams {
  value: string | Date; // Date value
  data: any; // Full row data
  format?: string; // Optional date format
  showRelative?: boolean; // Whether to show relative time
}

/**
 * Boolean cell renderer parameters
 */
export interface BooleanRendererParams {
  value: boolean; // Boolean value
  data: any; // Full row data
  trueText?: string; // Text to show for true values
  falseText?: string; // Text to show for false values
  showIcon?: boolean; // Whether to show icons instead of text
}

/**
 * Tags/Labels cell renderer parameters
 */
export interface TagsRendererParams {
  value: any[]; // Array of tag/label objects
  data: any; // Full row data
  maxTags?: number; // Maximum number of tags to show
  colorField?: string; // Field name for tag color
  nameField?: string; // Field name for tag name
}

/**
 * State cell renderer parameters (for PR/Issue states)
 */
export interface StateRendererParams {
  value: string; // State value (open, closed, merged, etc.)
  data: any; // Full row data
  showIcon?: boolean; // Whether to show state icon
  colorMapping?: Record<string, string>; // Custom color mapping for states
}

/**
 * Commit SHA cell renderer parameters
 */
export interface CommitShaRendererParams {
  value: string; // Full SHA
  data: any; // Full row data
  shortLength?: number; // Length of shortened SHA (default: 7)
  showCopyButton?: boolean; // Whether to show copy button
}

/**
 * GitHub-specific cell renderer configurations
 */
export const GITHUB_CELL_RENDERERS: Record<string, AGGridCellRenderer> = {
  avatarRenderer: {
    component: 'AvatarCellRenderer',
    params: {
      size: 32,
      showTooltip: true
    }
  },
  urlRenderer: {
    component: 'UrlCellRenderer',
    params: {
      linkText: 'View',
      openInNewTab: true,
      showIcon: true
    }
  },
  dateRenderer: {
    component: 'DateCellRenderer',
    params: {
      format: 'MMM dd, yyyy',
      showRelative: true
    }
  },
  booleanRenderer: {
    component: 'BooleanCellRenderer',
    params: {
      trueText: 'Yes',
      falseText: 'No',
      showIcon: true
    }
  },
  tagsRenderer: {
    component: 'TagsCellRenderer',
    params: {
      maxTags: 3,
      colorField: 'color',
      nameField: 'name'
    }
  },
  stateRenderer: {
    component: 'StateCellRenderer',
    params: {
      showIcon: true,
      colorMapping: {
        'open': '#28a745',
        'closed': '#dc3545',
        'merged': '#6f42c1',
        'draft': '#6c757d'
      }
    }
  },
  commitShaRenderer: {
    component: 'CommitShaCellRenderer',
    params: {
      shortLength: 7,
      showCopyButton: true
    }
  }
};

/**
 * Get cell renderer configuration by name
 * @param rendererName The name of the cell renderer
 * @returns Cell renderer configuration
 */
export function getCellRenderer(rendererName: string): AGGridCellRenderer | undefined {
  return GITHUB_CELL_RENDERERS[rendererName];
}

/**
 * Cell renderer component interface that all custom renderers should implement
 */
export interface GitHubCellRendererComponent {
  agInit(params: any): void;
  getGui(): HTMLElement;
  refresh?(params: any): boolean;
  destroy?(): void;
}