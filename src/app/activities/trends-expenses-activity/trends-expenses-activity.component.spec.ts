import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TrendsExpensesActivityComponent } from './trends-expenses-activity.component';

describe('TrendsExpensesActivityComponent', () => {
  let component: TrendsExpensesActivityComponent;
  let fixture: ComponentFixture<TrendsExpensesActivityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TrendsExpensesActivityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TrendsExpensesActivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
