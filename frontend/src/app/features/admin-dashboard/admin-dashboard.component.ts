import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-layout">
      <header class="navbar">
        <div class="container flex justify-between items-center" style="padding: 0;">
          <div class="brand flex items-center" style="gap: 1rem;">
            <div class="logo-badge" style="font-size: 1.5rem;">🏦</div>
            <div>
              <h1 style="margin:0; font-size: 1.25rem; font-weight: 600; color: white;">Card Dispute Portal</h1>
              <span style="font-size: 0.85rem; color: #94A3B8;">Admin Control Center</span>
            </div>
          </div>
          <button class="btn btn-outline btn-logout" (click)="logout()">Sign Out</button>
        </div>
      </header>

      <main class="container">
        <h2 style="color: var(--text-primary); margin-bottom: 1.5rem;">Disputes Requiring Review</h2>
        <div class="card mb-4" style="padding: 0; overflow: hidden;">
          <table class="data-table" *ngIf="needsReviewDisputes.length > 0">
            <thead>
              <tr>
                <th>Dispute ID</th>
                <th>Status</th>
                <th>Reason</th>
                <th class="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let d of needsReviewDisputes">
                <td style="font-weight: 600; color: var(--text-primary);">#{{ d.id }}</td>
                <td>
                  <span class="badge" [ngClass]="{
                    'badge-info': d.status === 'SUBMITTED',
                    'badge-warning': d.status === 'UNDER_REVIEW'
                  }">{{ d.status }}</span>
                </td>
                <td style="color: var(--text-secondary);">{{ d.reason }}</td>
                <td class="text-right">
                  <button class="btn btn-primary" style="padding: 0.4rem 0.8rem; font-size: 0.85rem;" (click)="review(d.id)">Review</button>
                </td>
              </tr>
            </tbody>
          </table>
          <p *ngIf="needsReviewDisputes.length === 0" class="text-center" style="padding: 3rem; color: var(--text-secondary); margin: 0;">No disputes require review.</p>
        </div>

        <h2 style="color: var(--text-primary); margin-bottom: 1.5rem; margin-top: 3rem;">Past Disputes</h2>
        <div class="card" style="padding: 0; overflow: hidden;">
          <table class="data-table" *ngIf="pastDisputes.length > 0">
            <thead>
              <tr>
                <th>Dispute ID</th>
                <th>Status</th>
                <th>Reason</th>
                <th class="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let d of pastDisputes">
                <td style="font-weight: 600; color: var(--text-primary);">#{{ d.id }}</td>
                <td>
                  <span class="badge" [ngClass]="{
                    'badge-success': d.status === 'APPROVED',
                    'badge-error': d.status === 'REJECTED'
                  }">{{ d.status }}</span>
                </td>
                <td style="color: var(--text-secondary);">{{ d.reason }}</td>
                <td class="text-right">
                  <button class="btn btn-outline" style="padding: 0.4rem 0.8rem; font-size: 0.85rem;" (click)="review(d.id)">View</button>
                </td>
              </tr>
            </tbody>
          </table>
          <p *ngIf="pastDisputes.length === 0" class="text-center" style="padding: 3rem; color: var(--text-secondary); margin: 0;">No past disputes found.</p>
        </div>
      </main>
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
  `]
})
export class AdminDashboardComponent implements OnInit {
  allDisputes: any[] = [];
  needsReviewDisputes: any[] = [];
  pastDisputes: any[] = []; // In a real system, filter to this admin's reviews

  constructor(
    private http: HttpClient, 
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.http.get<any[]>('http://localhost:8080/api/admin/disputes').subscribe({
      next: (data) => {
        this.allDisputes = data;
        this.needsReviewDisputes = data.filter(d => d.status === 'SUBMITTED' || d.status === 'UNDER_REVIEW');
        this.pastDisputes = data.filter(d => d.status === 'APPROVED' || d.status === 'REJECTED');
      },
      error: (err) => console.error('Failed to load disputes', err)
    });
  }

  review(disputeId: number) {
    this.router.navigate(['/dispute', disputeId, 'timeline']);
  }

  logout() {
    this.authService.logout();
  }
}
