import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';
  
  private tokenSubject = new BehaviorSubject<string | null>(this.getToken());
  public token$ = this.tokenSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        if (response.token) {
          this.setToken(response.token);
        }
      })
    );
  }

  register(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, credentials).pipe(
      tap(response => {
        if (response.token) {
          this.setToken(response.token);
        }
      })
    );
  }

  logout() {
    localStorage.removeItem('jwt_token');
    this.tokenSubject.next(null);
    this.router.navigate(['/login']);
  }

  private setToken(token: string) {
    localStorage.setItem('jwt_token', token);
    this.tokenSubject.next(token);
  }

  public getToken(): string | null {
    return localStorage.getItem('jwt_token');
  }

  public isAuthenticated(): boolean {
    return !!this.getToken();
  }

  public getRole(): string | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role || null;
    } catch (e) {
      return null;
    }
  }

  public getUserId(): number | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.userId || null;
    } catch (e) {
      return null;
    }
  }

  public isAdmin(): boolean {
    return this.getRole() === 'ADMIN';
  }
}
