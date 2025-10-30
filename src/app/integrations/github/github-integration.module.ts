import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

// Angular Material Imports
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

// AG Grid Imports
import { AgGridModule } from 'ag-grid-angular';

// Components
import { GitHubIntegrationComponent } from './components/github-integration.component';

// Services
import { GitHubAuthService } from './services/github-auth.service';
// import { GitHubDataService } from './services/github-data.service';
import { GitHubStateService } from './services/github-state.service';
import { GitHubDataService } from './services/github-data.service';
import { Dashboard } from '../../dashboard/dashboard';

const routes: Routes = [
  {
    path: '',
    component: GitHubIntegrationComponent
  }
];

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    GitHubIntegrationComponent,
    Dashboard,

    // Angular Material Modules
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

    // AG Grid Module
    AgGridModule
  ],
  providers: [
    GitHubAuthService,
    GitHubDataService,
    GitHubStateService
  ]
})
export class GitHubIntegrationModule { }