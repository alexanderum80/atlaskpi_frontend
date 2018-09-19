import { WidgetAlertComponent } from './widget-alert/widget-alert.component';
import { EditWidgetComponent } from './edit-widget/edit-widget.component';
import { NewWidgetComponent } from './new-widget/new-widget.component';
import { ListWidgetsComponent } from './list-widgets/list-widgets.component';
import { AuthGuard } from '../shared/services/auth-guard.service';
import { WidgetsComponent } from './widgets.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: 'widgets', component: WidgetsComponent, canActivate: [ AuthGuard ], children:
    [
      { path: '', component: ListWidgetsComponent, canActivate: [ AuthGuard ] },
      { path: 'new', component: NewWidgetComponent, canActivate: [ AuthGuard ] },
      { path: 'edit/:id', component: EditWidgetComponent, canActivate: [ AuthGuard ]},
      { path: 'alert/:id', component: WidgetAlertComponent, canActivate: [AuthGuard] }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WidgetsRoutingModule { }
