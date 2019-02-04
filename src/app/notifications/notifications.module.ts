import { NgModule } from '@angular/core';

import { SharedModule } from '../shared';
import { NotificationComponent } from './notification/notification.component';
import { NotificationsRoutingModule } from './notifications-routing.module';
import { NotificationsComponent } from './notifications.component';
import { SearchNotificationsComponent } from './search-notifications/search-notifications.component';
import { CommonModule } from '../../../node_modules/@angular/common';

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        NotificationsRoutingModule
    ],
    declarations: [NotificationsComponent, SearchNotificationsComponent, NotificationComponent]
})
export class NotificationsModule { }
