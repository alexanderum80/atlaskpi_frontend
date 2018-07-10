import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListChartsSlideshowComponent } from './list-charts-slideshow.component';

describe('ListChartsSlideshowComponent', () => {
  let component: ListChartsSlideshowComponent;
  let fixture: ComponentFixture<ListChartsSlideshowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListChartsSlideshowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListChartsSlideshowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
