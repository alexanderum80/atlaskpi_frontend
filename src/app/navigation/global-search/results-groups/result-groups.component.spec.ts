import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultGroupsComponent } from './result-groups.component';

describe('ResultsGroupsComponent', () => {
  let component: ResultGroupsComponent;
  let fixture: ComponentFixture<ResultGroupsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResultGroupsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResultGroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
