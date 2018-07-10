import { NotificationComponent } from './notification/notification.component';
import { SearchNotificationsComponent } from './search-notifications/search-notifications.component';
import { AuthGuard } from '../shared/services';
import { NotificationsComponent } from './notifications.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
    { path: 'notifications', component: NotificationsComponent, canActivate: [AuthGuard], children: [
        { path: 'search', component: SearchNotificationsComponent },
        { path: ':id', component: NotificationComponent }
    ] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NotificationsRoutingModule { }
