import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartGalleryComponent } from './chart-gallery.component';

describe('ChartGalleryComponent', () => {
  let component: ChartGalleryComponent;
  let fixture: ComponentFixture<ChartGalleryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChartGalleryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChartGalleryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
