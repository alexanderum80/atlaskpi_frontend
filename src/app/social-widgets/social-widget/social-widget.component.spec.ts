import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SocialWidgetComponent } from './social-widget.component';

describe('SocialWidgetComponent', () => {
  let component: SocialWidgetComponent;
  let fixture: ComponentFixture<SocialWidgetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SocialWidgetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SocialWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
