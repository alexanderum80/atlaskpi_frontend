import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeformatPickerComponent } from './timeformat-picker.component';

describe('TimeformatPickerComponent', () => {
  let component: TimeformatPickerComponent;
  let fixture: ComponentFixture<TimeformatPickerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimeformatPickerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeformatPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
