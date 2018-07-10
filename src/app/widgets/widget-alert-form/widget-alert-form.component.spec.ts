import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WidgetAlertFormComponent } from './widget-alert-form.component';

describe('WidgetAlertFormComponent', () => {
  let component: WidgetAlertFormComponent;
  let fixture: ComponentFixture<WidgetAlertFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WidgetAlertFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WidgetAlertFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
