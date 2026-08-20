import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { AuthService } from '../../core/auth/auth.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { FormsModule } from '@angular/forms';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['login', 'isAdmin']);
    const rSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent, FormsModule],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: rSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to /admin if user is admin', () => {
    authServiceSpy.login.and.returnValue(of({ token: 'dummy_token' }));
    authServiceSpy.isAdmin.and.returnValue(true);

    component.email = 'admin@example.com';
    component.password = 'password123';
    component.onSubmit();

    expect(authServiceSpy.login).toHaveBeenCalledWith({ email: 'admin@example.com', password: 'password123' });
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/admin']);
  });

  it('should navigate to /dashboard if user is not admin', () => {
    authServiceSpy.login.and.returnValue(of({ token: 'dummy_token' }));
    authServiceSpy.isAdmin.and.returnValue(false);

    component.email = 'test@example.com';
    component.password = 'password123';
    component.onSubmit();

    expect(authServiceSpy.login).toHaveBeenCalledWith({ email: 'test@example.com', password: 'password123' });
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should handle login error', () => {
    spyOn(window, 'alert');
    authServiceSpy.login.and.returnValue(throwError(() => new Error('Login failed')));

    component.onSubmit();

    expect(window.alert).toHaveBeenCalledWith('Login failed');
    expect(component.loading).toBeFalse();
  });
});
