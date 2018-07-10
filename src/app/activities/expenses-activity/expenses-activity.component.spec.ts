import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpensesActivityComponent } from './expenses-activity.component';

describe('ExpensesActivityComponent', () => {
  let component: ExpensesActivityComponent;
  let fixture: ComponentFixture<ExpensesActivityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExpensesActivityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpensesActivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
