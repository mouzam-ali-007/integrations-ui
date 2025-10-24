import { Routes } from '@angular/router';
import { Integrations } from './integrations/integrations';

/* 
    Routing
*/
export const routes: Routes = [
  { path: '', redirectTo: 'integration', pathMatch: 'full' },
  { path: 'integration', component: Integrations },
];

