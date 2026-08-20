import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-dispute-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-backdrop">
      <div class="modal-content card">
        <div class="modal-header flex justify-between items-center mb-4">
          <h2 style="margin: 0; font-size: 1.25rem; font-weight: 600; color: var(--text-primary);">Dispute Transaction</h2>
          <button class="close-icon" (click)="close.emit()" style="background: none; border: none; font-size: 1.5rem; color: var(--text-secondary); cursor: pointer;">&times;</button>
        </div>

        <div class="tx-summary card mb-4" style="background-color: #F8FAFC; border-color: #E2E8F0; padding: 1rem;">
          <div class="flex justify-between mb-2" style="font-size: 0.95rem;">
            <span style="color: var(--text-secondary);">Merchant:</span>
            <span style="font-weight: 500; color: var(--text-primary);">{{ transaction?.merchantName }}</span>
          </div>
          <div class="flex justify-between mb-2" style="font-size: 0.95rem;">
            <span style="color: var(--text-secondary);">Amount:</span>
            <span style="font-weight: 700; color: var(--text-primary);">\${{ transaction?.amount | number:'1.2-2' }}</span>
          </div>
          <div class="flex justify-between" style="font-size: 0.95rem;">
            <span style="color: var(--text-secondary);">Date:</span>
            <span style="font-weight: 500; color: var(--text-primary);">{{ transaction?.postedDate | date:'medium' }}</span>
          </div>
        </div>
        
        <div class="form-group mb-4">
          <label for="reason" class="form-label">Reason for Dispute <span style="color: #EF4444;">*</span></label>
          <textarea 
            id="reason"
            [(ngModel)]="reason" 
            rows="4" 
            placeholder="Describe why this transaction is unauthorized or incorrect (e.g. fraudulent charge, duplicate billing)..."
            class="form-control"
            style="resize: vertical;"
          ></textarea>
        </div>

        <div *ngIf="errorMessage" class="mb-4 p-3 rounded" style="background-color: #FEE2E2; color: #991B1B; font-size: 0.9rem;">
          {{ errorMessage }}
        </div>
        
        <div class="flex justify-end mt-4" style="gap: 1rem;">
          <button type="button" class="btn btn-outline" (click)="close.emit()" [disabled]="loading">Cancel</button>
          <button type="button" class="btn btn-primary" (click)="submit()" [disabled]="!reason.trim() || loading">
            {{ loading ? 'Securing & Submitting...' : 'Submit Dispute' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-backdrop { 
      position: fixed; 
      top: 0; 
      left: 0; 
      width: 100vw; 
      height: 100vh; 
      background: rgba(15, 23, 42, 0.65); 
      backdrop-filter: blur(4px);
      display: flex; 
      justify-content: center; 
      align-items: center; 
      z-index: 1000;
    }
    .modal-content { 
      width: 90%; 
      max-width: 520px; 
      animation: modalIn 0.2s ease-out;
    }
    @keyframes modalIn {
      from { opacity: 0; transform: translateY(10px) scale(0.98); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
  `]
})
export class DisputeModalComponent {
  @Input() transaction: any;
  @Output() close = new EventEmitter<void>();
  @Output() submitted = new EventEmitter<any>();
  
  reason = '';
  loading = false;
  errorMessage = '';

  constructor(private http: HttpClient) {}

  submit() {
    if (!this.reason.trim()) return;
    this.loading = true;
    this.errorMessage = '';

    const idempotencyKey = crypto.randomUUID();
    const headers = new HttpHeaders({
      'Idempotency-Key': idempotencyKey
    });

    const payload = {
      transactionId: this.transaction.id,
      reason: this.reason
    };

    this.http.post<any>('http://localhost:8080/api/disputes', payload, { headers }).subscribe({
      next: (createdDispute) => {
        this.loading = false;
        this.submitted.emit(createdDispute);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Failed to submit dispute. Please check your connection.';
      }
    });
  }
}
