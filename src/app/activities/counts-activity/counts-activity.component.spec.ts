import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CountsActivityComponent } from './counts-activity.component';

describe('CountsActivityComponent', () => {
  let component: CountsActivityComponent;
  let fixture: ComponentFixture<CountsActivityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CountsActivityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CountsActivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
