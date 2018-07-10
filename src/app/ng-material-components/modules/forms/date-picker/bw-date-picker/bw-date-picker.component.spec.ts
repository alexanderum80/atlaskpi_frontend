import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BwDatePickerComponent } from './bw-date-picker.component';

describe('BwDatePickerComponent', () => {
  let component: BwDatePickerComponent;
  let fixture: ComponentFixture<BwDatePickerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BwDatePickerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BwDatePickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
