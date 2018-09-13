import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewMilestonesTargetComponent } from './new-milestones-target.component';

describe('NewMilestonesTargetComponent', () => {
  let component: NewMilestonesTargetComponent;
  let fixture: ComponentFixture<NewMilestonesTargetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewMilestonesTargetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewMilestonesTargetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
