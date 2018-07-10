import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WidgetsAlertListComponent } from './widgets-alert-list.component';

describe('WidgetsAlertListComponent', () => {
  let component: WidgetsAlertListComponent;
  let fixture: ComponentFixture<WidgetsAlertListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WidgetsAlertListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WidgetsAlertListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
