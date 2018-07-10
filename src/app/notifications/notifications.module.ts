import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NotificationsRoutingModule } from './notifications-routing.module';
import { NotificationsComponent } from './notifications.component';
import { SearchNotificationsComponent } from './search-notifications/search-notifications.component';
import { NotificationComponent } from './notification/notification.component';

@NgModule({
  imports: [
    CommonModule,
    NotificationsRoutingModule
  ],
  declarations: [NotificationsComponent, SearchNotificationsComponent, NotificationComponent]
})
export class NotificationsModule { }
