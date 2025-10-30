// File: dashboard.component.ts
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { GridApi, ColDef, GridOptions,  ModuleRegistry, AllCommunityModule  } from 'ag-grid-community';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, debounceTime } from 'rxjs';


// ✅ Register AG Grid Community Modules
ModuleRegistry.registerModules([AllCommunityModule]);

interface DashboardEntity {
  key: string;
  display: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, AgGridAngular],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'],
})
export class Dashboard implements OnInit, AfterViewInit {
  @ViewChild(AgGridAngular) agGrid!: AgGridAngular;

  private gridApi!: GridApi<any>;
  isLoading = false;

  /**
   * Use this to switch between static columns (default) and dynamic, if desired.
   */
  useDynamicColumns = false; // set true for dynamic columns

  // Default: Static columnDefs for GitHub orgs
  columnDefs: ColDef[] = [
    { headerName: 'Login', field: 'login', sortable: true, filter: true },
    { headerName: 'ID', field: 'id', sortable: true, filter: 'agNumberColumnFilter' },
    { headerName: 'Node ID', field: 'node_id', sortable: true, filter: true },
    { headerName: 'URL', field: 'url', sortable: true, filter: true, cellRenderer: this.urlCellRenderer },
    { headerName: 'Repos URL', field: 'repos_url', sortable: true, filter: true, cellRenderer: this.urlCellRenderer },
    { headerName: 'Avatar', field: 'avatar_url', cellRenderer: this.avatarCellRenderer },
    { headerName: 'Description', field: 'description', sortable: true, filter: true },
  ];
  rowData: any[] = [
    {
      login: 'Mettics-Lab',
      id: 240983254,
      node_id: 'O_kgDODl0c1g',
      url: 'https://api.github.com/orgs/Mettics-Lab',
      repos_url: 'https://api.github.com/orgs/Mettics-Lab/repos',
      avatar_url: 'https://avatars.githubusercontent.com/u/240983254?v=4',
      description: null,
    },
    {
      login: 'mettics-dev',
      id: 240983929,
      node_id: 'O_kgDODl0feQ',
      url: 'https://api.github.com/orgs/mettics-dev',
      repos_url: 'https://api.github.com/orgs/mettics-dev/repos',
      avatar_url: 'https://avatars.githubusercontent.com/u/240983929?v=4',
      description: null,
    },
  ];

  collections: DashboardEntity[] = [
    { key: 'organizations', display: 'Organizations' },
    { key: 'repositories', display: 'Repositories' },
    { key: 'issues', display: 'Issues' },
    { key: 'commits', display: 'Commits' },
    { key: 'pull_requests', display: 'Pull Requests' }
  ];
  currentEntity = this.collections[0].key;

  /** Hardcoded static datasets for demo */
  staticData: { [key: string]: any[] } = {
    organizations: [
      {
        login: 'Mettics-Lab',
        id: 240983254,
        node_id: 'O_kgDODl0c1g',
        url: 'https://api.github.com/orgs/Mettics-Lab',
        repos_url: 'https://api.github.com/orgs/Mettics-Lab/repos',
        avatar_url: 'https://avatars.githubusercontent.com/u/240983254?v=4',
        description: null,
      },
      {
        login: 'mettics-dev',
        id: 240983929,
        node_id: 'O_kgDODl0feQ',
        url: 'https://api.github.com/orgs/mettics-dev',
        repos_url: 'https://api.github.com/orgs/mettics-dev/repos',
        avatar_url: 'https://avatars.githubusercontent.com/u/240983929?v=4',
        description: null,
      },
    ],
    repositories: [
      {
        id: 123456789,
        name: 'angular-dashboard',
        full_name: 'Mettics-Lab/angular-dashboard',
        private: false,
        html_url: 'https://github.com/Mettics-Lab/angular-dashboard',
        description: 'A dashboard application built with Angular and AG Grid.',
        created_at: '2022-04-20T10:00:00Z',
        updated_at: '2022-05-10T15:30:00Z',
        pushed_at: '2022-05-10T15:30:00Z',
        homepage: 'https://mettics.io',
        size: 1024,
        stargazers_count: 10,
        watchers_count: 10,
        forks_count: 5,
        open_issues_count: 5,
        topics: ['angular', 'dashboard', 'ag-grid'],
        has_issues: true,
        has_projects: true,
        has_wiki: true,
        has_pages: false,
        forks: 5,
        open_issues: 5,
        watchers: 10,
        default_branch: 'main',
        score: 1,
      },
      {
        id: 987654321,
        name: 'angular-app',
        full_name: 'mettics-dev/angular-app',
        private: false,
        html_url: 'https://github.com/mettics-dev/angular-app',
        description: 'Another Angular application for demonstration.',
        created_at: '2022-04-25T09:00:00Z',
        updated_at: '2022-05-05T10:00:00Z',
        pushed_at: '2022-05-05T10:00:00Z',
        homepage: null,
        size: 512,
        stargazers_count: 5,
        watchers_count: 5,
        forks_count: 2,
        open_issues_count: 2,
        topics: ['angular', 'demo'],
        has_issues: true,
        has_projects: true,
        has_wiki: true,
        has_pages: false,
        forks: 2,
        open_issues: 2,
        watchers: 5,
        default_branch: 'main',
        score: 1,
      }
    ],
    issues: [
      {
        id: 123456789,
        title: 'Add search input to AG Grid',
        state: 'open',
        user: { login: 'Mettics-Lab', avatar_url: 'https://avatars.githubusercontent.com/u/240983254?v=4' },
        labels: [{ name: 'enhancement', color: '39a845' }],
        created_at: '2022-05-05T10:00:00Z',
        updated_at: '2022-05-07T13:29:00Z',
        html_url: 'https://github.com/Mettics-Lab/angular-dashboard/issues/1',
        number: 1,
        comments: 0,
        pull_request: null,
      },
      {
        id: 987654321,
        title: 'Fix mobile grid overflow',
        state: 'closed',
        user: { login: 'mettics-dev', avatar_url: 'https://avatars.githubusercontent.com/u/240983929?v=4' },
        labels: [{ name: 'bug', color: 'ee2222'}],
        created_at: '2022-05-01T08:40:00Z',
        updated_at: '2022-05-03T17:01:00Z',
        html_url: 'https://github.com/Mettics-Lab/angular-dashboard/issues/2',
        number: 2,
        comments: 0,
        pull_request: null,
      }
    ],
    commits: [
      {
        sha: 'abc123def456',
        commit: {
          message: 'Initial commit',
          author: { name: 'Alice', date: '2022-05-02T08:30:00Z' }
        },
        author: { login: 'mettics-dev', avatar_url: 'https://avatars.githubusercontent.com/u/240983929?v=4' },
        html_url: 'https://github.com/Mettics-Lab/angular-dashboard/commit/abc123def456'
      },
      {
        sha: '789xyz654wvu',
        commit: {
          message: 'Fix bug in dashboard',
          author: { name: 'Bob', date: '2022-05-04T18:01:00Z' }
        },
        author: { login: 'Mettics-Lab', avatar_url: 'https://avatars.githubusercontent.com/u/240983254?v=4' },
        html_url: 'https://github.com/Mettics-Lab/angular-dashboard/commit/789xyz654wvu'
      }
    ],
    pull_requests: [
      {
        number: 25,
        title: 'Add search input to AG Grid',
        state: 'open',
        user: { login: 'Mettics-Lab', avatar_url: 'https://avatars.githubusercontent.com/u/240983254?v=4' },
        labels: [{ name: 'enhancement', color: '39a845' }],
        created_at: '2022-05-05T10:00:00Z',
        updated_at: '2022-05-07T13:29:00Z',
        html_url: 'https://github.com/Mettics-Lab/angular-dashboard/pull/25',
   
        comments: 0,
      },
      {
        number: 8,
        title: 'Fix mobile grid overflow',
        state: 'closed',
        comments: 8,
        user: { login: 'mettics-dev', avatar_url: 'https://avatars.githubusercontent.com/u/240983929?v=4' },
        labels: [{ name: 'bug', color: 'ee2222'}],
        created_at: '2022-05-01T08:40:00Z',
        updated_at: '2022-05-03T17:01:00Z',
        html_url: 'https://github.com/Mettics-Lab/angular-dashboard/pull/8',
       
      }
    ]
  };

  
  gridOptions: GridOptions = {
    defaultColDef: {
      sortable: true,
      resizable: true,
      filter: true,
      floatingFilter: true,
      minWidth: 100,
      filterParams: { debounceMs: 200 },
    },
    pagination: true,
    paginationPageSize: 25,
    animateRows: true,
    suppressRowClickSelection: false,
    rowSelection: 'single',
  };

  private search$ = new BehaviorSubject<string>('');
  public globalSearchText = '';

  constructor() {
    console.log("rowData", this.rowData)
    // No need to set data here, handled by public properties above
  }

  // ✅ URL renderer
  private urlCellRenderer(params: any): string {
    return `<a href="${params.value}" target="_blank">${params.value}</a>`;
  }

  // ✅ Avatar renderer
  private avatarCellRenderer(params: any): string {
    return `<img src="${params.value}" alt="Avatar" style="width: 40px; height: 40px; border-radius: 50%;">`;
  }

  ngOnInit(): void {

    // Debounce global search
    this.search$.pipe(debounceTime(250)).subscribe((text) => {
      if (this.gridApi) {
        this.gridApi.setGridOption('quickFilterText', text);
      }
    });
    // If you want to use dynamic detection, you can call loadData here:
    // if (this.useDynamicColumns) {
    //   this.loadData(this.rowData);
    // }
  }

  ngAfterViewInit(): void {
    // Nothing needed: static rowData/columnDefs used by default for grid
    // If you want to use dynamic columns:
    // if (this.useDynamicColumns) {
    //   this.loadData(this.rowData);
    // }
  }

  // 🧠 Handle global search input
  onGlobalSearchChange(text: string) {
    this.search$.next(text);
  }

  // ✅ Dynamic data loader
  async loadData(newData: any[]) {
    this.rowData = newData;

    const fieldSet = new Set<string>();
    for (const d of newData) this.collectFields(d, '', fieldSet);

    const cols: ColDef[] = [];
    for (const field of Array.from(fieldSet)) {
      cols.push({
        headerName: this.humanize(field),
        field: field,
        sortable: true,
        filter: this.detectFilterType(field, newData),
        valueGetter: (params: any) => this.safeGet(params.data, field),
        flex: 1,
        minWidth: 120,
      });
    }

    this.columnDefs = cols;

    if (this.gridApi) {
      // ✅ use modern API
      this.gridApi.setGridOption('columnDefs', this.columnDefs);
      this.gridApi.setGridOption('rowData', this.rowData);
    }
  }


  async selectEntity(entityKey: string) {
    this.isLoading = true;
    this.currentEntity = entityKey;

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const newData = this.staticData[entityKey] || [];

    // Load into grid
    await this.loadData(newData);

    // Hide spinner
    this.isLoading = false;
  }

  // ✅ Recursively gather field paths
  private collectFields(obj: any, prefix: string, set: Set<string>) {
    if (obj === null || obj === undefined) return;
    if (Array.isArray(obj)) {
      set.add(prefix || 'array');
      if (obj.length > 0 && typeof obj[0] === 'object') {
        this.collectFields(obj[0], prefix ? `${prefix}[]` : '[]', set);
      }
      return;
    }
    if (typeof obj !== 'object') {
      if (prefix) set.add(prefix);
      return;
    }
    for (const key of Object.keys(obj)) {
      const path = prefix ? `${prefix}.${key}` : key;
      const val = obj[key];
      if (val && typeof val === 'object') {
        this.collectFields(val, path, set);
      } else {
        set.add(path);
      }
    }
  }

  private safeGet(row: any, path: string) {
    if (!row || !path) return null;
    const val = this.getByPath(row, path.replace(/\[\]/g, ''));
    if (typeof val === 'object') return JSON.stringify(val);
    return val;
  }

  private getByPath(obj: any, path: string) {
    return path.split('.').reduce((acc, key) => acc && acc[key], obj);
  }

  private humanize(path: string) {
    return path
      .replace(/\[\]/g, ' Array')
      .split('.')
      .map((p) =>
        p
          .replace(/_/g, ' ')
          .replace(/\b\w/g, (m) => m.toUpperCase())
      )
      .join(' - ');
  }

  private detectFilterType(field: string, data: any[]) {
    for (const r of data) {
      const v = this.safeGet(r, field);
      if (v === null || v === undefined) continue;
      if (!isNaN(Number(v))) return 'agNumberColumnFilter';
      if (this.isISODate(String(v))) return 'agDateColumnFilter';
      return 'agTextColumnFilter';
    }
    return 'agTextColumnFilter';
  }

  private isISODate(v: string) {
    return /^\d{4}-\d{2}-\d{2}(T|$)/.test(v);
  }

  // ✅ Grid ready hook
  onGridReady(params: any) {
    this.gridApi = params.api;
    // Static or dynamic, use current definitions:
    this.gridApi.setGridOption('columnDefs', this.columnDefs);
    this.gridApi.setGridOption('rowData', this.rowData);
  }

  // ✅ Handle updated data sets
  async onDataUpdate(newData: any[]) {
    await this.loadData(newData);
  }
}


