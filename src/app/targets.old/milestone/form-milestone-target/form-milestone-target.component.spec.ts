import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormMilestoneTargetComponent } from './form-milestone-target.component';

describe('FormMilestoneTargetComponent', () => {
  let component: FormMilestoneTargetComponent;
  let fixture: ComponentFixture<FormMilestoneTargetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormMilestoneTargetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormMilestoneTargetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
