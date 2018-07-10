import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartViewMiniComponent } from './chart-view-mini.component';

describe('ChartViewMiniComponent', () => {
  let component: ChartViewMiniComponent;
  let fixture: ComponentFixture<ChartViewMiniComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChartViewMiniComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChartViewMiniComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
