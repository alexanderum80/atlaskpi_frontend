import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardFilterFormComponent } from './dashboard-filter-form.component';

describe('DashboardFilterFormComponent', () => {
  let component: DashboardFilterFormComponent;
  let fixture: ComponentFixture<DashboardFilterFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardFilterFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardFilterFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
