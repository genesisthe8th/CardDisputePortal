import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TimelineComponent } from './timeline.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from '../../core/auth/auth.service';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('TimelineComponent', () => {
  let component: TimelineComponent;
  let fixture: ComponentFixture<TimelineComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['isAdmin']);

    await TestBed.configureTestingModule({
      imports: [TimelineComponent, HttpClientTestingModule, RouterTestingModule],
      providers: [
        { provide: AuthService, useValue: authSpy },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => '10' } } }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TimelineComponent);
    component = fixture.componentInstance;
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should display reviewer controls if user is admin', () => {
    authServiceSpy.isAdmin.and.returnValue(true);
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.reviewer-panel')).toBeTruthy();
  });

  it('should hide reviewer controls if user is not admin', () => {
    authServiceSpy.isAdmin.and.returnValue(false);
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.reviewer-panel')).toBeFalsy();
  });
});
