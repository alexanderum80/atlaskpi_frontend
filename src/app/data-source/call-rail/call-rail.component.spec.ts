import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CallRailComponent } from './call-rail.component';

describe('CallRailComponent', () => {
  let component: CallRailComponent;
  let fixture: ComponentFixture<CallRailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CallRailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CallRailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
