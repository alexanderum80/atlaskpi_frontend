import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NoSlideshowsComponent } from './no-slideshows.component';

describe('NoSlideshowsComponent', () => {
  let component: NoSlideshowsComponent;
  let fixture: ComponentFixture<NoSlideshowsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NoSlideshowsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NoSlideshowsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
