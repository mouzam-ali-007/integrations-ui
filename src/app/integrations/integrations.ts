import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-integrations',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './integrations.html',
  styleUrls: ['./integrations.scss'],
})
export class Integrations{
  isConnected = false;

  connectToGithub() {
    this.isConnected = !this.isConnected;
  }
}
