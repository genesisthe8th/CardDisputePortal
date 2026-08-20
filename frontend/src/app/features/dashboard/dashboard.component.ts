import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { DisputeModalComponent } from '../dispute-modal/dispute-modal.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, DisputeModalComponent],
  template: `
    <div class="dashboard-layout">
      <header class="navbar">
        <div class="container flex justify-between items-center" style="padding: 0;">
          <div class="brand flex items-center" style="gap: 1rem;">
            <div class="logo-badge" style="font-size: 1.5rem;">🏦</div>
            <div>
              <h1 style="margin:0; font-size: 1.25rem; font-weight: 600; color: white;">Card Dispute Portal</h1>
              <span style="font-size: 0.85rem; color: #94A3B8;">User Dashboard</span>
            </div>
          </div>
          <button class="btn btn-outline btn-logout" (click)="logout()">Sign Out</button>
        </div>
      </header>

      <main class="container">
        <!-- Success Alert Toast -->
        <div *ngIf="successMessage" class="alert success-alert card mb-4 flex justify-between items-center" style="border-color: #A7F3D0; background-color: #ECFDF5;">
          <div class="flex items-center" style="gap: 1rem;">
            <span style="font-size: 1.5rem; color: #059669;">✓</span>
            <div>
              <strong style="color: #065F46;">{{ successMessage }}</strong>
              <p *ngIf="lastDisputedId" style="margin: 0; font-size: 0.9rem; color: #065F46;">Dispute record created. You can track all state changes in the audit log.</p>
            </div>
          </div>
          <button *ngIf="lastDisputedId" class="btn btn-primary" style="background-color: #059669;" (click)="viewAuditTrail(lastDisputedId)">
            View Audit Trail &rarr;
          </button>
        </div>

        <div class="flex justify-between items-center mb-4 mt-4">
          <div>
            <h2 style="margin: 0; color: var(--text-primary);">Transaction History</h2>
            <p style="margin: 0; color: var(--text-secondary); font-size: 0.95rem;">Review your charges and initiate disputes for unauthorized or incorrect amounts.</p>
          </div>
          <button class="btn btn-outline" (click)="loadData()">↻ Refresh</button>
        </div>
        
        <div class="card" style="padding: 0; overflow: hidden;">
          <table class="data-table">
            <thead>
              <tr>
                <th>Merchant</th>
                <th>Date</th>
                <th class="text-right">Amount</th>
                <th>Status</th>
                <th class="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let t of transactions">
                <td style="font-weight: 500; color: var(--text-primary);">{{ t.merchantName }}</td>
                <td style="color: var(--text-secondary);">{{ t.postedDate | date:'medium' }}</td>
                <td class="text-right" style="font-weight: 600; color: var(--text-primary);">\${{ t.amount | number:'1.2-2' }}</td>
                <td>
                  <span *ngIf="getDisputeFor(t)" class="badge" [ngClass]="{
                    'badge-info': getDisputeFor(t)?.status === 'SUBMITTED',
                    'badge-warning': getDisputeFor(t)?.status === 'UNDER_REVIEW',
                    'badge-success': getDisputeFor(t)?.status === 'APPROVED',
                    'badge-error': getDisputeFor(t)?.status === 'REJECTED'
                  }">
                    {{ getDisputeFor(t)?.status }}
                  </span>
                  <span *ngIf="!getDisputeFor(t)" style="color: #CBD5E1;">--</span>
                </td>
                <td class="text-right">
                  <button *ngIf="getDisputeFor(t) as dispute" class="btn btn-outline" style="padding: 0.4rem 0.8rem; font-size: 0.85rem;" (click)="viewAuditTrail(dispute.id)">
                    View Audit
                  </button>
                  <button *ngIf="!getDisputeFor(t)" class="btn btn-outline btn-danger" style="padding: 0.4rem 0.8rem; font-size: 0.85rem;" (click)="openDispute(t)">
                    Dispute
                  </button>
                </td>
              </tr>
              <tr *ngIf="transactions.length === 0">
                <td colspan="5" class="text-center" style="padding: 3rem; color: var(--text-secondary);">Loading transactions...</td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
      
      <!-- Dispute Modal -->
      <app-dispute-modal
        *ngIf="selectedTransaction"
        [transaction]="selectedTransaction"
        (close)="closeDispute()"
        (submitted)="onDisputeSubmitted($event)"
      ></app-dispute-modal>
    </div>
  `,
  styles: [`
    .dashboard-layout {
      min-height: 100vh;
    }
    .navbar {
      background: var(--primary);
      padding: 1.25rem 0;
      box-shadow: var(--shadow-md);
    }
    .btn-logout {
      color: white; 
      border-color: #334155;
    }
    .btn-logout:hover {
      background-color: #334155;
      border-color: #475569;
    }
    .btn-danger {
      color: #DC2626;
      border-color: #FECACA;
    }
    .btn-danger:hover {
      background-color: #FEF2F2;
      border-color: #F87171;
    }
  `]
})
export class DashboardComponent implements OnInit {
  transactions: any[] = [];
  disputes: any[] = [];
  selectedTransaction: any = null;
  successMessage: string | null = null;
  lastDisputedId: number | null = null;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    // Load transactions
    this.http.get<any[]>('http://localhost:8080/api/transactions').subscribe({
      next: (data) => this.transactions = data,
      error: () => this.handleAuthError()
    });

    // Load existing disputes
    this.http.get<any[]>('http://localhost:8080/api/disputes').subscribe({
      next: (data) => this.disputes = data,
      error: () => this.handleAuthError()
    });
  }

  getDisputeFor(transaction: any) {
    return this.disputes.find(d => d.transaction && d.transaction.id === transaction.id);
  }

  openDispute(transaction: any) {
    this.selectedTransaction = transaction;
  }

  closeDispute() {
    this.selectedTransaction = null;
  }

  onDisputeSubmitted(createdDispute: any) {
    this.selectedTransaction = null;
    this.successMessage = 'Dispute submitted successfully and logged to the audit trail!';
    this.lastDisputedId = createdDispute.id;
    this.loadData(); // Refresh list to show dispute badge and audit button

    // Auto-dismiss notification after 8 seconds
    setTimeout(() => {
      this.successMessage = null;
    }, 8000);
  }

  viewAuditTrail(disputeId: number) {
    this.router.navigate([`/dispute/${disputeId}/timeline`]);
  }

  private handleAuthError() {
    localStorage.removeItem('jwt_token');
    this.router.navigate(['/login']);
  }

  logout() {
    localStorage.removeItem('jwt_token');
    this.router.navigate(['/login']);
  }
}
