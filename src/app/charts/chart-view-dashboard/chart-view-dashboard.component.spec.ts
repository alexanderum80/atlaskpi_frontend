import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartViewDashboardComponent } from './chart-view-dashboard.component';

describe('ChartViewMiniComponent', () => {
  let component: ChartViewDashboardComponent;
  let fixture: ComponentFixture<ChartViewDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChartViewDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChartViewDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
