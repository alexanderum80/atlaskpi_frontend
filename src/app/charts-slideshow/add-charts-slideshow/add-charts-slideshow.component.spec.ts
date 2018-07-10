import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddChartsSlideshowComponent } from './add-charts-slideshow.component';

describe('AddChartsSlideshowComponent', () => {
  let component: AddChartsSlideshowComponent;
  let fixture: ComponentFixture<AddChartsSlideshowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddChartsSlideshowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddChartsSlideshowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
