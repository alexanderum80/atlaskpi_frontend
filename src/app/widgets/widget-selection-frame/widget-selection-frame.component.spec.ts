import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WidgetSelectionFrameComponent } from './widget-selection-frame.component';

describe('WidgetSelectionFrameComponent', () => {
  let component: WidgetSelectionFrameComponent;
  let fixture: ComponentFixture<WidgetSelectionFrameComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WidgetSelectionFrameComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WidgetSelectionFrameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
