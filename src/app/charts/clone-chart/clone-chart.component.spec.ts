import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CloneChartComponent } from './clone-chart.component';

describe('CloneChartComponent', () => {
  let component: CloneChartComponent;
  let fixture: ComponentFixture<CloneChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CloneChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CloneChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
