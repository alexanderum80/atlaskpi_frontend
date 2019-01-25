import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowAllDataEntryComponent } from './show-all-data-entry.component';

describe('ShowAllDataEntryComponent', () => {
  let component: ShowAllDataEntryComponent;
  let fixture: ComponentFixture<ShowAllDataEntryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShowAllDataEntryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShowAllDataEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
