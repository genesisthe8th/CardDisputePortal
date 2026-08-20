import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-timeline',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="dashboard-layout" style="background-color: var(--bg-color); min-height: 100vh; padding: 2.5rem 1rem;">
      <div class="container" style="max-width: 800px;">
        <div class="card" style="padding: 2.5rem;">
          <header class="header flex justify-between items-center mb-4 pb-4" style="border-bottom: 1px solid var(--border-color);">
            <div>
              <button class="btn btn-outline mb-2" (click)="goBack()">&larr; Back to Dashboard</button>
              <h1 style="margin: 0; font-size: 1.5rem; color: var(--text-primary); font-weight: 600;">Dispute Audit Trail & Lifecycle</h1>
            </div>
            <span class="badge badge-info" style="font-size: 0.95rem; padding: 0.4rem 0.8rem;">Dispute #{{ disputeId }}</span>
          </header>

          <!-- Simulated Reviewer / Analyst Controls -->
          <section class="card mb-4" *ngIf="authService.isAdmin()" style="background-color: #F8FAFC; border-color: #CBD5E1;">
            <div class="mb-3">
              <h3 style="margin: 0 0 0.5rem 0; font-size: 1.1rem; color: var(--text-primary);">⚖️ Dispute Decision Engine</h3>
              <p style="margin: 0; font-size: 0.9rem; color: var(--text-secondary);">Simulate how back-office analysts or network webhooks approve or reject this dispute.</p>
            </div>
            <div class="form-group mb-3">
              <input 
                type="text" 
                [(ngModel)]="reviewNotes" 
                placeholder="Enter review notes (e.g. 'Merchant accepted liability' or 'Proof of delivery provided')..." 
                class="form-control"
              />
            </div>
            <div class="flex" style="gap: 1rem;">
              <button 
                class="btn btn-outline" 
                (click)="submitDecision('UNDER_REVIEW')"
                [disabled]="processing"
              >
                Mark Under Review
              </button>
              <button 
                class="btn btn-primary" 
                style="background-color: #059669; border-color: #059669;"
                (click)="submitDecision('APPROVED')"
                [disabled]="processing"
              >
                ✓ Approve (Issue Credit)
              </button>
              <button 
                class="btn btn-primary" 
                style="background-color: #DC2626; border-color: #DC2626;"
                (click)="submitDecision('REJECTED')"
                [disabled]="processing"
              >
                ✕ Reject (Deny Claim)
              </button>
            </div>
          </section>

          <div *ngIf="loading" class="text-center" style="padding: 3rem; color: var(--text-secondary);">
            <p>Loading immutable audit logs...</p>
          </div>

          <div *ngIf="!loading && auditLogs.length === 0" class="text-center" style="padding: 3rem; color: var(--text-secondary);">
            <p>No audit log events found for Dispute #{{ disputeId }}.</p>
          </div>

          <div class="timeline mt-4" *ngIf="!loading && auditLogs.length > 0">
            <div class="timeline-entry" *ngFor="let log of auditLogs; let i = index">
              <div class="node-track">
                <div class="node-dot" [ngClass]="getDotClass(log.newState)"></div>
                <div class="node-line" *ngIf="i !== auditLogs.length - 1"></div>
              </div>

              <div class="log-card card" style="background-color: #F8FAFC;">
                <div class="flex justify-between items-center mb-2">
                  <span class="badge" style="background-color: #E2E8F0; color: #334155;">{{ log.entityType }} AUDIT EVENT</span>
                  <span style="font-size: 0.85rem; color: var(--text-secondary);">{{ log.timestamp | date:'medium' }}</span>
                </div>

                <div class="mb-2">
                  <strong style="font-size: 0.9rem; color: var(--text-primary);">State Recorded:</strong>
                  <div class="state-payload">{{ log.newState }}</div>
                </div>

                <div *ngIf="log.previousState" class="mb-3">
                  <span style="font-size: 0.85rem; color: var(--text-secondary);">Previous: <code>{{ log.previousState }}</code></span>
                </div>

                <div class="flex" style="gap: 1.5rem; font-size: 0.8rem; color: var(--text-secondary);">
                  <span>Authorized Actor: <code style="background-color: #E2E8F0; padding: 0.1rem 0.3rem; border-radius: 4px; color: #0F172A;">User #{{ log.changedBy }}</code></span>
                  <span>Audit Sequence ID: <code style="background-color: #E2E8F0; padding: 0.1rem 0.3rem; border-radius: 4px; color: #0F172A;">#{{ log.id }}</code></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .timeline { position: relative; }
    .timeline-entry { display: flex; gap: 1.25rem; margin-bottom: 1.5rem; }
    .timeline-entry:last-child { margin-bottom: 0; }
    .node-track { display: flex; flex-direction: column; align-items: center; width: 24px; }
    .node-dot {
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: var(--primary);
      box-shadow: 0 0 0 4px #DBEAFE;
      margin-top: 6px;
    }
    .node-dot.approved { background: #16A34A; box-shadow: 0 0 0 4px #DCFCE7; }
    .node-dot.rejected { background: #DC2626; box-shadow: 0 0 0 4px #FEE2E2; }
    .node-dot.review { background: #D97706; box-shadow: 0 0 0 4px #FEF3C7; }
    .node-line { width: 2px; background: #E2E8F0; flex-grow: 1; margin-top: 6px; }
    .log-card { flex-grow: 1; padding: 1.25rem; }
    .state-payload {
      margin-top: 0.4rem;
      background: #FFFFFF;
      border: 1px solid #CBD5E1;
      padding: 0.65rem 0.85rem;
      border-radius: 6px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 0.875rem;
      color: #0F172A;
    }
  `]
})
export class TimelineComponent implements OnInit {
  auditLogs: any[] = [];
  disputeId: string | null = null;
  loading = true;
  reviewNotes = '';
  processing = false;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    public authService: AuthService
  ) {}

  ngOnInit() {
    this.disputeId = this.route.snapshot.paramMap.get('id');
    if (this.disputeId) {
      this.loadAuditLogs(this.disputeId);
    } else {
      this.loading = false;
    }
  }

  loadAuditLogs(id: string) {
    this.loading = true;
    this.http.get<any[]>(`http://localhost:8080/api/disputes/${id}/audit`).subscribe({
      next: (data) => {
        this.auditLogs = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        alert('Failed to load audit logs');
      }
    });
  }

  submitDecision(status: string) {
    if (!this.disputeId) return;
    this.processing = true;

    const payload = {
      status: status,
      reviewNotes: this.reviewNotes || `Decision marked as ${status}`
    };

    this.http.patch(`http://localhost:8080/api/admin/disputes/${this.disputeId}/review`, payload).subscribe({
      next: () => {
        this.processing = false;
        this.reviewNotes = '';
        this.loadAuditLogs(this.disputeId!);
      },
      error: () => {
        this.processing = false;
        alert('Failed to submit review decision');
      }
    });
  }

  getDotClass(stateText: string): string {
    if (!stateText) return '';
    if (stateText.includes('APPROVED')) return 'approved';
    if (stateText.includes('REJECTED')) return 'rejected';
    if (stateText.includes('UNDER_REVIEW')) return 'review';
    return '';
  }

  goBack() {
    if (this.authService.isAdmin()) {
      this.router.navigate(['/admin']);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }
}
