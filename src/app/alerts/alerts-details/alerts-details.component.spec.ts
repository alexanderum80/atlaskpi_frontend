import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AlertsDetailsComponent } from './alerts-details.component';

describe('AlertsDetailsComponent', () => {
  let component: AlertsDetailsComponent;
  let fixture: ComponentFixture<AlertsDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AlertsDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AlertsDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
