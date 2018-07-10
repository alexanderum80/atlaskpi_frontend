import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KpiDaterangePickerComponent } from './kpi-daterange-picker.component';

describe('KpiDaterangePickerComponent', () => {
  let component: KpiDaterangePickerComponent;
  let fixture: ComponentFixture<KpiDaterangePickerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KpiDaterangePickerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KpiDaterangePickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
