import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { TimelineComponent } from './features/timeline/timeline.component';
import { authGuard } from './core/auth/auth.guard';

import { adminGuard } from './core/auth/admin.guard';
import { AdminDashboardComponent } from './features/admin-dashboard/admin-dashboard.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'admin', component: AdminDashboardComponent, canActivate: [adminGuard] },
  { path: 'dispute/:id/timeline', component: TimelineComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '/login' }
];
