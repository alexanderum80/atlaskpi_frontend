import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WidgetNoAlertsComponent } from './widget-no-alerts.component';

describe('WidgetNoAlertsComponent', () => {
  let component: WidgetNoAlertsComponent;
  let fixture: ComponentFixture<WidgetNoAlertsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WidgetNoAlertsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WidgetNoAlertsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
