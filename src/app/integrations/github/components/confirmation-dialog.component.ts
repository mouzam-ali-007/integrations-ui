import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmationDialogData {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    icon?: string;
    color?: 'primary' | 'accent' | 'warn';
}

@Component({
    selector: 'app-confirmation-dialog',
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatDialogModule,
        MatIconModule
    ],
    template: `
    <div class="confirmation-dialog">
      <h2 mat-dialog-title>
        <mat-icon *ngIf="data.icon" [class]="'icon-' + (data.color || 'primary')">{{ data.icon }}</mat-icon>
        {{ data.title }}
      </h2>
      
      <mat-dialog-content>
        <p>{{ data.message }}</p>
      </mat-dialog-content>
      
      <mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()">
          {{ data.cancelText || 'Cancel' }}
        </button>
        <button mat-raised-button 
                [color]="data.color || 'primary'" 
                (click)="onConfirm()"
                cdkFocusInitial>
          {{ data.confirmText || 'Confirm' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
    styles: [`
    .confirmation-dialog {
      min-width: 300px;
      max-width: 500px;
    }
    
    h2[mat-dialog-title] {
      display: flex;
      align-items: center;
      margin-bottom: 16px;
    }
    
    mat-icon {
      margin-right: 8px;
      
      &.icon-warn {
        color: #f44336;
      }
      
      &.icon-accent {
        color: #ff9800;
      }
      
      &.icon-primary {
        color: #2196f3;
      }
    }
    
    mat-dialog-content p {
      margin: 0;
      line-height: 1.5;
    }
    
    mat-dialog-actions {
      margin-top: 24px;
      gap: 8px;
    }
  `]
})
export class ConfirmationDialogComponent {
    constructor(
        public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: ConfirmationDialogData
    ) { }

    onCancel(): void {
        this.dialogRef.close(false);
    }

    onConfirm(): void {
        this.dialogRef.close(true);
    }
}