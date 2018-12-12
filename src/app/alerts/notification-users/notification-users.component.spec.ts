import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationUsersComponent } from './notification-users.component';

describe('NotificationUsersComponent', () => {
  let component: NotificationUsersComponent;
  let fixture: ComponentFixture<NotificationUsersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NotificationUsersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
