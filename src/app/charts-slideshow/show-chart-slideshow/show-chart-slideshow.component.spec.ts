import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowChartSlideshowComponent } from './show-chart-slideshow.component';

describe('ShowChartSlideshowComponent', () => {
  let component: ShowChartSlideshowComponent;
  let fixture: ComponentFixture<ShowChartSlideshowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShowChartSlideshowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShowChartSlideshowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
