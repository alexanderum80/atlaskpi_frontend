import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartDetailFilterComponent } from './chart-detail-filter.component';

describe('ChartDetailFilterComponent', () => {
  let component: ChartDetailFilterComponent;
  let fixture: ComponentFixture<ChartDetailFilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChartDetailFilterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChartDetailFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
