import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CallRailAccountidTooltipComponent } from './call-rail-accountid-tooltip.component';

describe('CallRailAccountidTooltipComponent', () => {
  let component: CallRailAccountidTooltipComponent;
  let fixture: ComponentFixture<CallRailAccountidTooltipComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CallRailAccountidTooltipComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CallRailAccountidTooltipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
