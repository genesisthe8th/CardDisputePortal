import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-layout">
      <div class="card login-card">
        <div class="text-center mb-4">
          <div class="logo-badge" style="font-size: 3rem; margin-bottom: 1rem;">🏦</div>
          <h2 style="margin: 0; color: var(--text-primary);">Card Dispute Portal</h2>
          <p style="color: var(--text-secondary); margin-top: 0.5rem; font-size: 0.95rem;">Secure Access Gateway</p>
        </div>
        <form (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label class="form-label">Email Address</label>
            <input class="form-control" type="email" [(ngModel)]="email" name="email" required placeholder="name@company.com" />
          </div>
          <div class="form-group">
            <label class="form-label">Password</label>
            <input class="form-control" type="password" [(ngModel)]="password" name="password" required placeholder="••••••••" />
          </div>
          <button class="btn btn-primary" type="submit" [disabled]="loading" style="width: 100%; margin-top: 1rem;">
            {{ loading ? 'Authenticating...' : 'Sign In' }}
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .login-layout {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background-color: var(--bg-color);
      background-image: radial-gradient(circle at top right, #e2e8f0 0%, transparent 40%),
                        radial-gradient(circle at bottom left, #e2e8f0 0%, transparent 40%);
    }
    .login-card {
      width: 100%;
      max-width: 420px;
      padding: 3rem 2.5rem;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
    }
  `]
})
export class LoginComponent {
  email = 'test@example.com';
  password = 'password123';
  loading = false;

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.loading = true;
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        if (this.authService.isAdmin()) {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: () => {
        alert('Login failed');
        this.loading = false;
      }
    });
  }
}
