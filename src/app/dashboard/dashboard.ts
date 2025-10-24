import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  standalone: true, 
})
export class Dashboard {
  isConnected = false;

  connectToGithub() {
    this.isConnected = !this.isConnected;
  }
}
