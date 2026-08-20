import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    
    // Clear localStorage before each test
    localStorage.removeItem('jwt_token');
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should correctly decode token role as ADMIN', () => {
    // base64url encoded header.payload.signature
    // payload: {"sub":"admin@example.com","role":"ADMIN"}
    const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbkBleGFtcGxlLmNvbSIsInJvbGUiOiJBRE1JTiJ9.signature';
    localStorage.setItem('jwt_token', mockToken);

    expect(service.isAuthenticated()).toBeTrue();
    expect(service.getRole()).toBe('ADMIN');
    expect(service.isAdmin()).toBeTrue();
  });

  it('should correctly decode token role as USER', () => {
    // payload: {"sub":"test@example.com","role":"USER"}
    const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0QGV4YW1wbGUuY29tIiwicm9sZSI6IlVTRVIifQ.signature';
    localStorage.setItem('jwt_token', mockToken);

    expect(service.isAuthenticated()).toBeTrue();
    expect(service.getRole()).toBe('USER');
    expect(service.isAdmin()).toBeFalse();
  });

  it('should logout and clear token', () => {
    localStorage.setItem('jwt_token', 'dummy_token');
    const navigateSpy = spyOn(router, 'navigate');

    service.logout();

    expect(localStorage.getItem('jwt_token')).toBeNull();
    expect(service.isAuthenticated()).toBeFalse();
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });
});
