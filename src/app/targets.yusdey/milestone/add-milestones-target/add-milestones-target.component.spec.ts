import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddMilestonesTargetComponent } from './add-milestones-target.component';

describe('AddMilestonesTargetComponent', () => {
  let component: AddMilestonesTargetComponent;
  let fixture: ComponentFixture<AddMilestonesTargetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddMilestonesTargetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddMilestonesTargetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
