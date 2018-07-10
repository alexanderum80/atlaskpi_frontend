import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TopEmployeeActivityComponent } from './top-employee-activity.component';

describe('TopEmployeeActivityComponent', () => {
  let component: TopEmployeeActivityComponent;
  let fixture: ComponentFixture<TopEmployeeActivityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TopEmployeeActivityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TopEmployeeActivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
