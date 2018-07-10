import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TrendsActivityComponent } from './trends-activity.component';

describe('TrendsActivityComponent', () => {
  let component: TrendsActivityComponent;
  let fixture: ComponentFixture<TrendsActivityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TrendsActivityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TrendsActivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
