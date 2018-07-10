import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditChartsSlideshowComponent } from './edit-charts-slideshow.component';

describe('EditChartsSlideshowComponent', () => {
  let component: EditChartsSlideshowComponent;
  let fixture: ComponentFixture<EditChartsSlideshowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditChartsSlideshowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditChartsSlideshowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
