import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WidgetAlertComponent } from './widget-alert.component';

describe('WidgetAlertComponent', () => {
  let component: WidgetAlertComponent;
  let fixture: ComponentFixture<WidgetAlertComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WidgetAlertComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WidgetAlertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
