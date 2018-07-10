import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartSlideshowFormComponent } from './chart-slideshow-form.component';

describe('ChartSlideshowFormComponent', () => {
  let component: ChartSlideshowFormComponent;
  let fixture: ComponentFixture<ChartSlideshowFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChartSlideshowFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChartSlideshowFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
