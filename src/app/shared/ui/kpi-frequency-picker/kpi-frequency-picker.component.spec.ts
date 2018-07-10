import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KpiFrequencyPickerComponent } from './kpi-frequency-picker.component';

describe('KpiFrequencyPickerComponent', () => {
  let component: KpiFrequencyPickerComponent;
  let fixture: ComponentFixture<KpiFrequencyPickerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KpiFrequencyPickerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KpiFrequencyPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
