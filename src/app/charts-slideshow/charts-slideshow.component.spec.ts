import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartsSlideshowComponent } from './charts-slideshow.component';

describe('ChartsSlideshowComponent', () => {
  let component: ChartsSlideshowComponent;
  let fixture: ComponentFixture<ChartsSlideshowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChartsSlideshowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChartsSlideshowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
