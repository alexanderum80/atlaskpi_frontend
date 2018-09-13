import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditMilestonesTargetComponent } from './edit-milestones-target.component';

describe('EditMilestonesTargetComponent', () => {
  let component: EditMilestonesTargetComponent;
  let fixture: ComponentFixture<EditMilestonesTargetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditMilestonesTargetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditMilestonesTargetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
