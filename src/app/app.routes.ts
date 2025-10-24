import { Routes } from '@angular/router';
import { Integrations } from './integrations/integrations';

/* 
    Routing
*/
export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./integrations/github/github-integration.module').then(m => m.GitHubIntegrationModule)
  },
  { path: 'integration', component: Integrations },
  {
    path: 'github-integration',
    loadChildren: () => import('./integrations/github/github-integration.module').then(m => m.GitHubIntegrationModule)
  },
];

