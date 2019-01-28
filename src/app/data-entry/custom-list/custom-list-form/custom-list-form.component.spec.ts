import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomListFormComponent } from './custom-list-form.component';

describe('CustomListFormComponent', () => {
  let component: CustomListFormComponent;
  let fixture: ComponentFixture<CustomListFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomListFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomListFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
