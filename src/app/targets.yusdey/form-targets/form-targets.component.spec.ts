import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormTargetsComponent } from './form-targets.component';

describe('FormTargetsComponent', () => {
  let component: FormTargetsComponent;
  let fixture: ComponentFixture<FormTargetsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormTargetsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormTargetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
