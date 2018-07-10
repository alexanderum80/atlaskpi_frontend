import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultDetailsItemComponent } from './result-details-item.component';

describe('ResultDetailsItemComponent', () => {
  let component: ResultDetailsItemComponent;
  let fixture: ComponentFixture<ResultDetailsItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResultDetailsItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResultDetailsItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
