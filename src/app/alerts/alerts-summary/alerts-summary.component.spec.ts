import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AlertsSummaryComponent } from './alerts-summary.component';

describe('AlertsSummaryComponent', () => {
  let component: AlertsSummaryComponent;
  let fixture: ComponentFixture<AlertsSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AlertsSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AlertsSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
