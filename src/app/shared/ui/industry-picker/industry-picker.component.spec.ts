import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IndustryPickerComponent } from './industry-picker.component';

describe('IndustryPickerComponent', () => {
  let component: IndustryPickerComponent;
  let fixture: ComponentFixture<IndustryPickerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IndustryPickerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IndustryPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
