import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartInspectorChartDetailsComponent } from './chart-inspector-chart-details.component';

describe('ChartInspectorChartDetailsComponent', () => {
  let component: ChartInspectorChartDetailsComponent;
  let fixture: ComponentFixture<ChartInspectorChartDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChartInspectorChartDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChartInspectorChartDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
