import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ActivitiesRoutingModule } from './activities-routing.module';
import { ActivitiesComponent } from './activities.component';
import { UsersActivityComponent } from './users-activity/users-activity.component';
import { TrendsSalesActivityComponent } from './trends-sales-activity/trends-sales-activity.component';
import { CountsActivityComponent } from './counts-activity/counts-activity.component';
import { TopEmployeeActivityComponent } from './top-employee-activity/top-employee-activity.component';
import { SalesActivityComponent } from './sales-activity/sales-activity.component';
import { ExpensesActivityComponent } from './expenses-activity/expenses-activity.component';
import { TrendsExpensesActivityComponent } from './trends-expenses-activity/trends-expenses-activity.component';

@NgModule({
  imports: [
    CommonModule,
    ActivitiesRoutingModule
  ],
  declarations: [
    ActivitiesComponent,
    UsersActivityComponent,
    TrendsSalesActivityComponent,
    CountsActivityComponent,
    TopEmployeeActivityComponent,
    SalesActivityComponent,
    ExpensesActivityComponent,
    TrendsExpensesActivityComponent
  ],
  exports: [
    ActivitiesComponent
  ]
})
export class ActivitiesModule { }
