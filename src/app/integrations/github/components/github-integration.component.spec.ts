import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { GitHubIntegrationComponent } from './github-integration.component';
import { GitHubAuthService } from '../services/github-auth.service';
import { GitHubDataService } from '../services/github-data.service';
import { GitHubStateService } from '../services/github-state.service';

describe('GitHubIntegrationComponent', () => {
  let component: GitHubIntegrationComponent;
  let fixture: ComponentFixture<GitHubIntegrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GitHubIntegrationComponent],
      imports: [
        HttpClientTestingModule,
        NoopAnimationsModule,
        MatSnackBarModule
      ],
      providers: [
        GitHubAuthService,
        GitHubDataService,
        GitHubStateService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(GitHubIntegrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with disconnected state', () => {
    expect(component.state.isConnected).toBeFalse();
    expect(component.state.userInfo).toBeNull();
  });

  it('should have default entity type set to repositories', () => {
    expect(component.state.selectedEntity).toBe('repositories');
  });
});