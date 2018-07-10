import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WeekDayPickerComponent } from './weekday-picker.component';

describe('WeekdayPickerComponent', () => {
  let component: WeekDayPickerComponent;
  let fixture: ComponentFixture<WeekDayPickerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WeekDayPickerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WeekDayPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
