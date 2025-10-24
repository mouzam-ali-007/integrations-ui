import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Dashboard } from './dashboard/dashboard';
import { Integrations } from './integrations/integrations';

@Component({
  selector: 'app-root',
  imports: [ Integrations],
 
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('industrial-park-dashboard');
}
