import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MobileWelcomeComponent } from './mobile-welcome.component';

describe('MobileWelcomeComponent', () => {
  let component: MobileWelcomeComponent;
  let fixture: ComponentFixture<MobileWelcomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MobileWelcomeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MobileWelcomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
