import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TargetsActivityComponent } from './targets-activity.component';

describe('TargetsActivityComponent', () => {
  let component: TargetsActivityComponent;
  let fixture: ComponentFixture<TargetsActivityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TargetsActivityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TargetsActivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
