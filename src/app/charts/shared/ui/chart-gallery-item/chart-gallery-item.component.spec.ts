import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartGalleryItemComponent } from './chart-gallery-item.component';

describe('ChartGalleryItemComponent', () => {
  let component: ChartGalleryItemComponent;
  let fixture: ComponentFixture<ChartGalleryItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChartGalleryItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChartGalleryItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
