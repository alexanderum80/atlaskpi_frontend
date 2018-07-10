import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AutoRenderableWidgetComponent } from './auto-renderable-widget.component';

describe('AutoRenderableWidgetComponent', () => {
  let component: AutoRenderableWidgetComponent;
  let fixture: ComponentFixture<AutoRenderableWidgetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AutoRenderableWidgetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AutoRenderableWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
