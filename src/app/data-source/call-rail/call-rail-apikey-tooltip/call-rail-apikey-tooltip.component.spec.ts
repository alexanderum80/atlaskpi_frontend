import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CallRailApikeyTooltipComponent } from './call-rail-apikey-tooltip.component';

describe('CallRailApikeyTooltipComponent', () => {
  let component: CallRailApikeyTooltipComponent;
  let fixture: ComponentFixture<CallRailApikeyTooltipComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CallRailApikeyTooltipComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CallRailApikeyTooltipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
