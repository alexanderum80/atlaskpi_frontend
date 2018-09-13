import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListMilestonesTargetComponent } from './list-milestones-target.component';

describe('ListMilestonesTargetComponent', () => {
  let component: ListMilestonesTargetComponent;
  let fixture: ComponentFixture<ListMilestonesTargetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListMilestonesTargetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListMilestonesTargetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
