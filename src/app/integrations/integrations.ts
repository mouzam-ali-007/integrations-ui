import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-integrations',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatGridListModule,
    MatChipsModule,
    MatDividerModule
  ],
  templateUrl: './integrations.html',
  styleUrls: ['./integrations.scss'],
})
export class Integrations {

  features = [
    {
      icon: 'security',
      title: 'Secure OAuth2 Authentication',
      description: 'Connect your GitHub account securely using industry-standard OAuth2 authentication flow.'
    },
    {
      icon: 'data_object',
      title: 'Comprehensive Data Access',
      description: 'Access repositories, issues, pull requests, commits, organizations, and user data.'
    },
    {
      icon: 'table_view',
      title: 'Advanced Data Grid',
      description: 'View and analyze your GitHub data with sorting, filtering, and pagination capabilities.'
    },
    {
      icon: 'search',
      title: 'Global Search',
      description: 'Search across all your GitHub data with powerful filtering and search functionality.'
    },
    {
      icon: 'devices',
      title: 'Responsive Design',
      description: 'Optimized for desktop, tablet, and mobile devices with Angular Material design.'
    },
    {
      icon: 'sync',
      title: 'Real-time Sync',
      description: 'Keep your data up-to-date with real-time synchronization and caching.'
    }
  ];

  supportedCollections = [
    'Organizations',
    'Repositories',
    'Pull Requests',
    'Issues',
    'Commits',
    'Users',
    'Changelogs'
  ];

  constructor(private router: Router) { }

  navigateToGitHubIntegration() {
    this.router.navigate(['/github-integration']);
  }
}
