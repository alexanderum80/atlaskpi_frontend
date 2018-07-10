import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeSettingsOnFlyComponent } from './change-settings-on-fly.component';

describe('ChangeSettingsOnFlyComponent', () => {
  let component: ChangeSettingsOnFlyComponent;
  let fixture: ComponentFixture<ChangeSettingsOnFlyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChangeSettingsOnFlyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangeSettingsOnFlyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
