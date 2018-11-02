import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DateFieldPopupComponent } from './date-field-popup.component';

describe('DateFieldPopupComponent', () => {
  let component: DateFieldPopupComponent;
  let fixture: ComponentFixture<DateFieldPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DateFieldPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DateFieldPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
