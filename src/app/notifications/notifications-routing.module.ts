import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '../shared/services';
import { NotificationsComponent } from './notifications.component';

const routes: Routes = [
    { path: 'notifications', component: NotificationsComponent, canActivate: [AuthGuard] },
    { path: 'notifications/:id', component: NotificationsComponent, canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NotificationsRoutingModule { }
