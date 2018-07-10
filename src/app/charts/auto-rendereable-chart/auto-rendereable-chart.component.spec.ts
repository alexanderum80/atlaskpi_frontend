import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AutoRendereableChartComponent } from './auto-rendereable-chart.component';

describe('AutoRendereableChartComponent', () => {
  let component: AutoRendereableChartComponent;
  let fixture: ComponentFixture<AutoRendereableChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AutoRendereableChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AutoRendereableChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
