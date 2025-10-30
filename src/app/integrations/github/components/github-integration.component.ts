import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';

// Angular CDK Imports
import { BreakpointObserver, Breakpoints, LayoutModule } from '@angular/cdk/layout';

// Angular Material Imports
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';

// AG Grid Imports
import { AgGridModule } from 'ag-grid-angular';

import { GitHubAuthService } from '../services/github-auth.service';
import { GitHubStateService } from '../services/github-state.service';
import { GitHubDataService } from '../services/github-data.service';
import {
  GitHubIntegrationState,
  GitHubEntityType,
  GitHubEntityConfig,
  PaginationParams,
  FilterParams,
  GitHubEntityDataResponse,
  LoadingOperation
} from '../models/github-interfaces';
import { ConfirmationDialogComponent, ConfirmationDialogData } from './confirmation-dialog.component';


@Component({
  selector: 'app-github-integration',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LayoutModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatSnackBarModule,
    MatDialogModule,
    MatExpansionModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatInputModule,
    MatFormFieldModule,
    MatToolbarModule,
    MatMenuModule,
    MatDividerModule,
    AgGridModule
  ],
  templateUrl: './github-integration.component.html',
  styleUrls: ['./github-integration.component.scss']
})
export class GitHubIntegrationComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  state: GitHubIntegrationState = {
    isConnected: false,
    isLoading: false,
    userInfo: null,
    connectionDate: null,
    selectedEntity: GitHubEntityType.REPOSITORIES,
    gridData: [],
    gridColumns: [],
    loadingOperation: undefined
  };

  entityTypes = Object.values(GitHubEntityType);
  availableEntities: GitHubEntityConfig[] = [];

  // AG Grid API references
  private gridApi: any;
  private gridColumnApi: any;

  // Global search functionality
  globalSearchControl = new FormControl('');
  private currentSearchTerm = '';

  // Responsive design properties
  isMobile = false;
  isTablet = false;
  isDesktop = false;
  currentBreakpoint = '';

  // Responsive grid configuration
  responsiveGridOptions: any = {};
  access_token =false;

  // AG Grid configuration
  gridOptions = {
    // Server-side row model configuration
    rowModelType: 'serverSide' as const,
    serverSideStoreType: 'partial' as const,
    cacheBlockSize: 50,
    maxBlocksInCache: 10,

    // Pagination configuration
    pagination: true,
    paginationPageSize: 50,
    paginationPageSizeSelector: [25, 50, 100, 200],

    // UI configuration
    animateRows: true,
    enableSorting: true,
    enableFilter: true,
    suppressMenuHide: true,
    suppressRowClickSelection: true,

  

    // Column configuration
    defaultColDef: {
      sortable: true,
      filter: true,
      resizable: true,
      minWidth: 100
    },



    // Event handlers
    onGridReady: (params: any) => this.onGridReady(params),
    onSortChanged: (params: any) => this.onSortChanged(params),
    onFilterChanged: (params: any) => this.onFilterChanged(params)
  };

  constructor(
    private authService: GitHubAuthService,
    private dataService: GitHubDataService,
    private stateService: GitHubStateService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private breakpointObserver: BreakpointObserver,
    private route: ActivatedRoute,
 private router: Router
  ) { }


  ngOnInit(): void {
    this.initializeComponent();
    this.subscribeToStateChanges();
    this.setupGlobalSearch();
    this.setupResponsiveDesign();
    this.checkForOAuth2Callback();

    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
  
    if (code) {
       this.getQueryParamsCode(code);
    }
  
  }


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }


  getQueryParamsCode (code :any) : void {
    console.log("code", code)

     

     if (code) {
      const token = localStorage.getItem('access_token');

        if(!token){
      this.authService.getAccessToken(code).subscribe({
        next: (res:any) => {
          console.log('Access Token Response:', res);
          localStorage.setItem('access_token', res.access_token);
          this.access_token = true;
          this.authService.saveUser(res.access_token).subscribe({
            next: (user:any) => {
              console.log(user)
            }
          })
        },
        error: (err:any) => {
          console.error('Error fetching access token:', err);
          this.access_token = false;
        }
      });
    }else {
      this.access_token = true;
    }
    }
  }

  viewCollection(): void {
    this.router.navigate(['/dashboard']);
  }

 

  removeAccessToken() : void {

  
      const token = localStorage.getItem('access_token');
      if (token) {
        localStorage.removeItem('access_token'); 

        this.authService.removeUser().subscribe({
          next: (response:any) => {
            console.log("DELETED")
          }
        })
      }
   
      // remove from api 
}

  //removeAccessToken
  /**
   * Handle window resize events for responsive grid adjustments
   */
  onWindowResize(): void {
    if (this.gridApi) {
      // Debounce resize events
      setTimeout(() => {
        this.gridApi.sizeColumnsToFit();
        this.applyResponsiveColumnConfiguration();
      }, 150);
    }
  }

  private initializeComponent(): void {
    // Load available entities from GitHubDataService
    this.loadAvailableEntities();

    // Restore connection state from persistent storage
    this.stateService.getConnectionState()
      .pipe(takeUntil(this.destroy$))
      .subscribe(connectionState => {
        this.state.isConnected = connectionState.isConnected;
        this.state.userInfo = connectionState.userInfo;
        this.state.connectionDate = connectionState.connectionDate;

        // If connected, validate the authentication state
        if (connectionState.isConnected) {
          this.validateAuthentication();
        }
      });
  }

  private subscribeToStateChanges(): void {
    // Subscribe to authentication state changes
    this.authService.getAuthenticationState()
      .pipe(takeUntil(this.destroy$))
      .subscribe(authState => {
        this.state.isConnected = authState.isConnected;
        this.state.userInfo = authState.userInfo;
        this.state.connectionDate = authState.connectionDate;

        // If connection state changed to connected, show success notification
        if (authState.isConnected && authState.userInfo) {
          this.showSuccessNotification(`Successfully connected to GitHub as ${authState.userInfo.username}`, 'Connection established');
        }
      });

    // Subscribe to loading state changes from auth service
    this.authService.getLoadingState()
      .pipe(takeUntil(this.destroy$))
      .subscribe(isLoading => {
        this.state.isLoading = isLoading;
      });
  }



  async connectToGitHub(): Promise<any> {
    this.state.isLoading = true;
  this.state.loadingOperation = 'connect';

try {
  console.log("initiateOAuth2Flow")
  const response = await  this.authService.initiateOAuth2Flow();
  // get code from query parameter 

  if (response) {
  // await this.getQueryParamsCode();
  }
  
  this.showSuccessNotification('GitHub authentication initiated successfully', 'Authentication started');
} catch (error) {
  this.state.isLoading = false;
  this.state.loadingOperation = undefined;
  console.error('OAuth2 flow initiation failed:', error);
  this.showErrorNotification('Failed to initiate GitHub authentication. Please try again.', 'Authentication failed');
}
  }  

  removeIntegration(): void {
    const dialogData: ConfirmationDialogData = {
      title: 'Remove GitHub Integration',
      message: 'Are you sure you want to remove your GitHub integration? This will disconnect your account and clear all cached data.',
      confirmText: 'Remove Integration',
      cancelText: 'Cancel',
      icon: 'warning',
      color: 'warn'
    };

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.state.isLoading = true;
        this.state.loadingOperation = 'remove';

        this.authService.removeIntegration()
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.state.isLoading = false;
              this.state.loadingOperation = undefined;
              this.resetComponentState();
              this.showSuccessNotification('GitHub integration removed successfully', 'Integration removed');
            },
            error: (error) => {
              this.state.isLoading = false;
              this.state.loadingOperation = undefined;
              console.error('Remove integration failed:', error);
              this.showErrorNotification('Failed to remove GitHub integration. Please try again.', 'Removal failed');
            }
          });
      }
    });
  }

  resyncIntegration(): void {
    const dialogData: ConfirmationDialogData = {
      title: 'Re-sync GitHub Integration',
      message: 'This will refresh your GitHub connection and reload all data. Any cached information will be updated.',
      confirmText: 'Re-sync Integration',
      cancelText: 'Cancel',
      icon: 'refresh',
      color: 'accent'
    };

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.state.isLoading = true;
        this.state.loadingOperation = 'resync';

        this.authService.resyncIntegration()
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.state.isLoading = false;
              this.state.loadingOperation = undefined;
              // Refresh current data if entity is selected
              if (this.state.selectedEntity) {
                this.loadEntityData();
              }
              this.showSuccessNotification('GitHub integration re-synced successfully', 'Integration updated');
            },
            error: (error) => {
              this.state.isLoading = false;
              this.state.loadingOperation = undefined;
              console.error('Resync integration failed:', error);
              this.showErrorNotification('Failed to re-sync GitHub integration. Please try again.', 'Re-sync failed');
            }
          });
      }
    });
  }

  onEntitySelectionChange(entityType: GitHubEntityType): void {
    if (this.state.selectedEntity !== entityType) {
      this.state.selectedEntity = entityType;

      // Clear previous data while loading new entity
      this.state.gridData = [];
      this.state.gridColumns = [];

      // Clear global search when changing entities
      this.globalSearchControl.setValue('');
      this.currentSearchTerm = '';

      // Load data for the selected entity if connected
      if (this.state.isConnected) {
        this.loadEntityData();
      }
    }
  }

  private loadEntityData(): void {
    if (!this.state.isConnected || !this.state.selectedEntity) {
      return;
    }

    this.state.isLoading = true;
    this.state.loadingOperation = 'schema';

    // Load entity schema first, then set up the datasource
    this.loadEntitySchema();
  }

  private loadEntitySchema(): void {
    this.dataService.getEntitySchema(this.state.selectedEntity)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (columns: any[]) => {
          this.state.gridColumns = this.enhanceColumnsWithRenderers(columns);
          this.state.isLoading = false;
          this.state.loadingOperation = undefined;

          // Set up server-side datasource after columns are loaded
          if (this.gridApi) {
            this.setupServerSideDatasource();
          }
        },
        error: (error: any) => {
          this.state.isLoading = false;
          this.state.loadingOperation = undefined;
          console.error('Failed to load entity schema:', error);
          this.showErrorNotification('Failed to load column configuration. Data may not display correctly.', 'Schema loading failed');
        }
      });
  }

  /**
   * Enhance column definitions with custom cell renderers and responsive configuration
   */
  private enhanceColumnsWithRenderers(columns: any[]): any[] {
    return columns.map(column => {
      const enhancedColumn = { ...column };

      // Add custom cell renderers based on field type or name
      if (column.cellRenderer) {
        // Use the renderer specified in the column definition
        enhancedColumn.cellRenderer = this.getCellRendererFunction(column.cellRenderer);
      } else if (column.field.includes('avatar_url') || column.field.includes('avatar')) {
        enhancedColumn.cellRenderer = this.avatarRenderer;
      } else if (column.field.includes('html_url') || column.field.includes('url')) {
        enhancedColumn.cellRenderer = this.urlRenderer;
      } else if (column.field.includes('_at') || column.field.includes('date')) {
        enhancedColumn.cellRenderer = this.dateRenderer;
      } else if (column.field === 'state') {
        enhancedColumn.cellRenderer = this.stateRenderer;
      } else if (column.field === 'labels' || column.field === 'tags') {
        enhancedColumn.cellRenderer = this.tagsRenderer;
      } else if (column.field === 'sha') {
        enhancedColumn.cellRenderer = this.commitShaRenderer;
      }

      // Add responsive configuration
      enhancedColumn.suppressSizeToFit = false;
      enhancedColumn.suppressAutoSize = false;

      // Set initial responsive properties (will be updated by applyResponsiveColumnConfiguration)
      const columnPriorities: Record<string, number> = {
        'name': 1,
        'title': 1,
        'login': 1,
        'username': 1,
        'full_name': 2,
        'description': 3,
        'state': 2,
        'created_at': 4,
        'updated_at': 5,
        'html_url': 6,
        'avatar_url': 7,
        'url': 8,
        'id': 9
      };

      enhancedColumn.priority = columnPriorities[column.field] || 5;

      return enhancedColumn;
    });
  }

  /**
   * Get cell renderer function by name
   */
  private getCellRendererFunction(rendererName: string): any {
    switch (rendererName) {
      case 'avatarRenderer':
        return this.avatarRenderer;
      case 'urlRenderer':
        return this.urlRenderer;
      case 'dateRenderer':
        return this.dateRenderer;
      case 'booleanRenderer':
        return this.booleanRenderer;
      case 'stateRenderer':
        return this.stateRenderer;
      case 'tagsRenderer':
        return this.tagsRenderer;
      case 'commitShaRenderer':
        return this.commitShaRenderer;
      default:
        return undefined;
    }
  }

  private resetComponentState(): void {
    this.state = {
      isConnected: false,
      isLoading: false,
      userInfo: null,
      connectionDate: null,
      selectedEntity: GitHubEntityType.REPOSITORIES,
      gridData: [],
      gridColumns: [],
      loadingOperation: undefined
    };

    // Clear global search
    this.globalSearchControl.setValue('');
    this.currentSearchTerm = '';
  }

  /**
   * Check for OAuth2 callback parameters in URL
   */
  private checkForOAuth2Callback(): void {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');

    if (code && state) {
      this.state.isLoading = true;
      this.state.loadingOperation = 'callback';

      this.authService.handleOAuth2Callback(code, state)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (connectionState) => {
            this.state.isLoading = false;
            this.state.loadingOperation = undefined;
            // Clear URL parameters
            window.history.replaceState({}, document.title, window.location.pathname);

            if (connectionState.isConnected) {
              this.showSuccessNotification('GitHub integration connected successfully!', 'Connection established');
            }
          },
          error: (error) => {
            this.state.isLoading = false;
            this.state.loadingOperation = undefined;
            console.error('OAuth2 callback handling failed:', error);
            this.showErrorNotification('Failed to complete GitHub authentication. Please try again.', 'Authentication failed');
            // Clear URL parameters even on error
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        });
    }
  }

  /**
   * Set up global search with debounced input
   */
  private setupGlobalSearch(): void {
    this.globalSearchControl.valueChanges
      .pipe(
        debounceTime(300), // 300ms delay for performance
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(searchTerm => {
        this.currentSearchTerm = searchTerm || '';
        this.onGlobalSearchChange();
      });
  }

  /**
   * Set up responsive design with breakpoint observer
   */
  private setupResponsiveDesign(): void {
    // Define custom breakpoints for better control
    const customBreakpoints = {
      mobile: '(max-width: 767px)',
      tablet: '(min-width: 768px) and (max-width: 1023px)',
      desktop: '(min-width: 1024px)',
      smallMobile: '(max-width: 479px)',
      largeMobile: '(min-width: 480px) and (max-width: 767px)'
    };

    // Observe breakpoint changes
    this.breakpointObserver.observe([
      customBreakpoints.mobile,
      customBreakpoints.tablet,
      customBreakpoints.desktop,
      customBreakpoints.smallMobile,
      customBreakpoints.largeMobile
    ]).pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        // Update responsive flags
        this.isMobile = this.breakpointObserver.isMatched(customBreakpoints.mobile);
        this.isTablet = this.breakpointObserver.isMatched(customBreakpoints.tablet);
        this.isDesktop = this.breakpointObserver.isMatched(customBreakpoints.desktop);

        // Determine current breakpoint
        if (this.breakpointObserver.isMatched(customBreakpoints.smallMobile)) {
          this.currentBreakpoint = 'small-mobile';
        } else if (this.breakpointObserver.isMatched(customBreakpoints.largeMobile)) {
          this.currentBreakpoint = 'large-mobile';
        } else if (this.isTablet) {
          this.currentBreakpoint = 'tablet';
        } else if (this.isDesktop) {
          this.currentBreakpoint = 'desktop';
        }

        // Update grid configuration based on breakpoint
        this.updateResponsiveGridConfiguration();

        // Apply responsive column configuration if grid is ready
        if (this.gridApi && this.state.gridColumns.length > 0) {
          this.applyResponsiveColumnConfiguration();
        }
      });
  }

  /**
   * Update responsive grid configuration based on current breakpoint
   */
  private updateResponsiveGridConfiguration(): void {
    const baseConfig = {
      // Base configuration that applies to all breakpoints
      animateRows: !this.isMobile, // Disable animations on mobile for performance
      enableSorting: true,
      enableFilter: !this.isMobile, // Disable column filters on mobile to save space
      suppressMenuHide: true,
      suppressRowClickSelection: true,
      pagination: true,
      rowSelection: 'single'
    };

    if (this.currentBreakpoint === 'small-mobile') {
      this.responsiveGridOptions = {
        ...baseConfig,
        paginationPageSize: 25,
        paginationPageSizeSelector: [10, 25, 50],
        enableFilter: false,
        suppressHorizontalScroll: false,
        alwaysShowHorizontalScroll: true,
        defaultColDef: {
          sortable: true,
          filter: false,
          resizable: false,
          minWidth: 120,
          maxWidth: 200
        }
      };
    } else if (this.currentBreakpoint === 'large-mobile') {
      this.responsiveGridOptions = {
        ...baseConfig,
        paginationPageSize: 25,
        paginationPageSizeSelector: [25, 50, 100],
        enableFilter: false,
        defaultColDef: {
          sortable: true,
          filter: false,
          resizable: true,
          minWidth: 100,
          maxWidth: 250
        }
      };
    } else if (this.isTablet) {
      this.responsiveGridOptions = {
        ...baseConfig,
        paginationPageSize: 50,
        paginationPageSizeSelector: [25, 50, 100],
        enableFilter: true,
        defaultColDef: {
          sortable: true,
          filter: true,
          resizable: true,
          minWidth: 100,
          maxWidth: 300
        }
      };
    } else {
      // Desktop configuration
      this.responsiveGridOptions = {
        ...baseConfig,
        paginationPageSize: 50,
        paginationPageSizeSelector: [25, 50, 100, 200],
        enableFilter: true,
        defaultColDef: {
          sortable: true,
          filter: true,
          resizable: true,
          minWidth: 100
        }
      };
    }

    // Update the main grid options
    Object.assign(this.gridOptions, this.responsiveGridOptions);
  }

  /**
   * Apply responsive column configuration based on screen size
   */
  private applyResponsiveColumnConfiguration(): void {
    if (!this.gridApi || !this.state.gridColumns.length) {
      return;
    }

    const columns = [...this.state.gridColumns];

    // Define column priorities (lower number = higher priority)
    const columnPriorities: Record<string, number> = {
      'name': 1,
      'title': 1,
      'login': 1,
      'username': 1,
      'full_name': 2,
      'description': 3,
      'state': 2,
      'created_at': 4,
      'updated_at': 5,
      'html_url': 6,
      'avatar_url': 7,
      'url': 8,
      'id': 9
    };

    // Configure column visibility based on breakpoint
    columns.forEach(column => {
      const priority = columnPriorities[column.field] || 5;

      if (this.currentBreakpoint === 'small-mobile') {
        // Show only highest priority columns on small mobile
        column.hide = priority > 2;
      } else if (this.currentBreakpoint === 'large-mobile') {
        // Show more columns on larger mobile screens
        column.hide = priority > 3;
      } else if (this.isTablet) {
        // Show most columns on tablet
        column.hide = priority > 6;
      } else {
        // Show all columns on desktop
        column.hide = false;
      }

      // Adjust column widths for mobile
      if (this.isMobile) {
        column.width = Math.min(column.width || 150, 200);
        column.maxWidth = 200;
      }
    });

    // Update column definitions
    this.gridApi.setColumnDefs(columns);

    // Auto-size columns for better mobile experience
    if (this.isMobile) {
      setTimeout(() => {
        this.gridApi.sizeColumnsToFit();
      }, 100);
    }
  }

  /**
   * Handle global search changes
   */
  private onGlobalSearchChange(): void {
    if (this.gridApi && this.state.isConnected && this.state.selectedEntity) {
      // Refresh the server-side datasource with new search term
      this.gridApi.refreshServerSideStore({ purge: true });
    }
  }

  /**
   * Clear global search
   */
  clearGlobalSearch(): void {
    this.globalSearchControl.setValue('');
  }

  /**
   * Load available GitHub entities from the data service
   */
  private loadAvailableEntities(): void {
    this.dataService.getAvailableEntities()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (entities: GitHubEntityConfig[]) => {
          this.availableEntities = entities;
        },
        error: (error: any) => {
          console.error('Failed to load available entities:', error);
          // Fallback to default entity types if service fails
          this.availableEntities = this.entityTypes.map(type => ({
            type,
            displayName: this.formatEntityDisplayName(type),
            apiEndpoint: `/${type}`,
            columns: []
          }));
        }
      });
  }

  /**
   * Format entity type for display in dropdown
   */
  private formatEntityDisplayName(entityType: GitHubEntityType): string {
    return entityType
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  }

  /**
   * AG Grid ready event handler
   */
  onGridReady(params: any): void {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;

    // Apply responsive configuration
    this.applyResponsiveColumnConfiguration();

    // Set up server-side datasource if connected and entity is selected
    if (this.state.isConnected && this.state.selectedEntity) {
      this.setupServerSideDatasource();
    }
  }

  /**
   * AG Grid sort changed event handler
   */
  onSortChanged(params: any): void {
    // Server-side datasource will handle sort changes automatically
    console.log('Sort changed:', params.api.getSortModel());
  }

  /**
   * AG Grid filter changed event handler
   */
  onFilterChanged(params: any): void {
    // Server-side datasource will handle filter changes automatically
    console.log('Filter changed:', params.api.getFilterModel());
  }

  /**
   * Set up server-side datasource for AG Grid
   */
  private setupServerSideDatasource(): void {
    if (!this.gridApi || !this.state.selectedEntity) {
      return;
    }

    const datasource = {
      getRows: (params: any) => {
        console.log('Server-side datasource getRows called with params:', params);

        // Extract pagination parameters
        const paginationParams: PaginationParams = {
          page: Math.floor(params.request.startRow / params.request.endRow) + 1,
          pageSize: params.request.endRow - params.request.startRow
        };

        // Extract sort parameters
        if (params.request.sortModel && params.request.sortModel.length > 0) {
          const sortModel = params.request.sortModel[0];
          paginationParams.sortBy = sortModel.colId;
          paginationParams.sortDirection = sortModel.sort;
        }

        // Extract filter parameters
        const filterParams: FilterParams = {
          columnFilters: {},
          globalSearch: this.currentSearchTerm || undefined
        };

        if (params.request.filterModel) {
          Object.keys(params.request.filterModel).forEach(key => {
            const filter = params.request.filterModel[key];
            if (filter.type === 'contains') {
              filterParams.columnFilters![key] = filter.filter;
            } else if (filter.type === 'equals') {
              filterParams.columnFilters![key] = filter.filter;
            }
          });
        }

        // Set loading state for data
        this.state.isLoading = true;
        this.state.loadingOperation = 'data';

        // Load data from service
        this.dataService.getEntityData(this.state.selectedEntity, paginationParams, filterParams)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (response: GitHubEntityDataResponse) => {
              this.state.isLoading = false;
              this.state.loadingOperation = undefined;

              // Calculate last row for AG Grid pagination
              let lastRow = -1;
              if (response.data.length < paginationParams.pageSize || !response.hasNextPage) {
                lastRow = params.request.startRow + response.data.length;
              }

              params.successCallback(response.data, lastRow);

              // Apply responsive sizing after data loads
              setTimeout(() => {
                this.optimizeGridForCurrentBreakpoint();
              }, 100);
            },
            error: (error: any) => {
              this.state.isLoading = false;
              this.state.loadingOperation = undefined;
              console.error('Failed to load data for AG Grid:', error);
              params.failCallback();

              this.showErrorNotification(`Failed to load ${this.state.selectedEntity}. Please try again.`, 'Data loading failed');
            }
          });
      }
    };

    this.gridApi.setServerSideDatasource(datasource);
  }

  /**
   * Optimize grid layout for current breakpoint
   */
  private optimizeGridForCurrentBreakpoint(): void {
    if (!this.gridApi) return;

    if (this.isMobile) {
      // On mobile, ensure columns fit the screen width
      this.gridApi.sizeColumnsToFit();
    } else if (this.isTablet) {
      // On tablet, auto-size columns but allow horizontal scroll if needed
      this.gridApi.autoSizeAllColumns();
      // If columns are too wide, fit them to screen
      setTimeout(() => {
        const containerWidth = this.gridApi.getDisplayedColumns().reduce((width: number, col: any) =>
          width + col.getActualWidth(), 0);
        if (containerWidth > window.innerWidth - 100) {
          this.gridApi.sizeColumnsToFit();
        }
      }, 50);
    } else {
      // On desktop, auto-size columns for optimal viewing
      this.gridApi.autoSizeAllColumns();
    }
  }

  /**
   * Custom cell renderer for avatar images
   */
  private avatarRenderer = (params: any) => {
    if (!params.value) return '';
    const username = params.data?.login || params.data?.username || 'User';
    return `<img src="${params.value}" alt="${username} avatar" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover;">`;
  };

  /**
   * Custom cell renderer for URLs
   */
  private urlRenderer = (params: any) => {
    if (!params.value) return '';
    const displayText = params.colDef?.cellRendererParams?.linkText || 'View';
    return `<a href="${params.value}" target="_blank" rel="noopener noreferrer" style="color: #1976d2; text-decoration: none;">${displayText}</a>`;
  };

  /**
   * Custom cell renderer for dates
   */
  private dateRenderer = (params: any) => {
    if (!params.value) return '';
    const date = new Date(params.value);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let relativeTime = '';
    if (diffDays === 0) {
      relativeTime = 'Today';
    } else if (diffDays === 1) {
      relativeTime = 'Yesterday';
    } else if (diffDays < 7) {
      relativeTime = `${diffDays} days ago`;
    } else if (diffDays < 30) {
      relativeTime = `${Math.floor(diffDays / 7)} weeks ago`;
    } else if (diffDays < 365) {
      relativeTime = `${Math.floor(diffDays / 30)} months ago`;
    } else {
      relativeTime = `${Math.floor(diffDays / 365)} years ago`;
    }

    const formattedDate = date.toLocaleDateString();
    return `<span title="${formattedDate}">${relativeTime}</span>`;
  };

  /**
   * Custom cell renderer for boolean values
   */
  private booleanRenderer = (params: any) => {
    if (params.value === null || params.value === undefined) return '';
    return params.value ?
      '<span style="color: #28a745;">✓</span>' :
      '<span style="color: #dc3545;">✗</span>';
  };

  /**
   * Custom cell renderer for state values (open, closed, merged, etc.)
   */
  private stateRenderer = (params: any) => {
    if (!params.value) return '';

    const stateColors: Record<string, string> = {
      'open': '#28a745',
      'closed': '#dc3545',
      'merged': '#6f42c1',
      'draft': '#6c757d'
    };

    const color = stateColors[params.value.toLowerCase()] || '#6c757d';
    const capitalizedState = params.value.charAt(0).toUpperCase() + params.value.slice(1);

    return `<span style="color: ${color}; font-weight: 500;">● ${capitalizedState}</span>`;
  };

  /**
   * Custom cell renderer for tags/labels
   */
  private tagsRenderer = (params: any) => {
    if (!params.value || !Array.isArray(params.value)) return '';

    const maxTags = 3;
    const tags = params.value.slice(0, maxTags);
    const remainingCount = params.value.length - maxTags;

    let html = tags.map((tag: any) => {
      const name = tag.name || tag;
      const color = tag.color || '#e1e4e8';
      return `<span style="background-color: #${color}; color: white; padding: 2px 6px; border-radius: 12px; font-size: 11px; margin-right: 4px;">${name}</span>`;
    }).join('');

    if (remainingCount > 0) {
      html += `<span style="color: #6c757d; font-size: 11px;">+${remainingCount} more</span>`;
    }

    return html;
  };

  /**
   * Custom cell renderer for commit SHA
   */
  private commitShaRenderer = (params: any) => {
    if (!params.value) return '';
    const shortSha = params.value.substring(0, 7);
    return `<code style="background-color: #f6f8fa; padding: 2px 4px; border-radius: 3px; font-family: monospace; font-size: 12px;">${shortSha}</code>`;
  };

  /**
   * Validate current authentication state
   */
  validateAuthentication(): void {
    if (this.state.isConnected) {
      this.authService.validateAuthenticationState()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (isValid) => {
            if (!isValid) {
              this.showWarningNotification('GitHub connection expired. Please reconnect.', 'Connection expired');
              this.resetComponentState();
            }
          },
          error: (error) => {
            console.error('Authentication validation failed:', error);
          }
        });
    }
  }

  /**
   * Show success notification with accessibility support
   */
  private showSuccessNotification(message: string, action: string = 'Close'): void {
    this.snackBar.open(message, action, {
      duration: 4000,
      panelClass: ['success-snackbar'],
      politeness: 'polite',
      announcementMessage: message
    });
  }

  /**
   * Show error notification with accessibility support
   */
  private showErrorNotification(message: string, action: string = 'Close'): void {
    this.snackBar.open(message, action, {
      duration: 6000,
      panelClass: ['error-snackbar'],
      politeness: 'assertive',
      announcementMessage: message
    });
  }

  /**
   * Show warning notification with accessibility support
   */
  private showWarningNotification(message: string, action: string = 'Close'): void {
    this.snackBar.open(message, action, {
      duration: 5000,
      panelClass: ['warning-snackbar'],
      politeness: 'assertive',
      announcementMessage: message
    });
  }

  /**
   * Show info notification with accessibility support
   */
  private showInfoNotification(message: string, action: string = 'Close'): void {
    this.snackBar.open(message, action, {
      duration: 4000,
      panelClass: ['info-snackbar'],
      politeness: 'polite',
      announcementMessage: message
    });
  }

  /**
   * TrackBy function for ngFor performance optimization
   */
  trackByIndex(index: number, item: any): number {
    return index;
  }
}