import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KpiGroupingPickerComponent } from './kpi-grouping-picker.component';

describe('KpiGroupingPickerComponent', () => {
  let component: KpiGroupingPickerComponent;
  let fixture: ComponentFixture<KpiGroupingPickerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KpiGroupingPickerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KpiGroupingPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
