import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VerifyEnrollmentComponent } from './verify-enrollment.component';

describe('VerifyEnrollmentComponent', () => {
  let component: VerifyEnrollmentComponent;
  let fixture: ComponentFixture<VerifyEnrollmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VerifyEnrollmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VerifyEnrollmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
