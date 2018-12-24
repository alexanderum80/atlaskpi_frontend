import { EnterDataFormComponent } from './enter-data-form/enter-data-form.component';
import { ShowAllDataEntryComponent } from './show-all-data-entry/show-all-data-entry.component';
import { DataEntryComponent } from './data-entry.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../shared/services';
import { NewDataEntryComponent } from './new-data-entry/new-data-entry.component';
import { CustomListComponent } from './custom-list/custom-list.component';

const routes: Routes = [
  {
    path: 'data-entry', component: DataEntryComponent, canActivate: [AuthGuard], children: [
      { path: 'custom-lists', component: CustomListComponent, canActivate: [AuthGuard] },
      { path: 'show-all', component: ShowAllDataEntryComponent, canActivate: [AuthGuard] },
      { path: 'new', component: NewDataEntryComponent, canActivate: [AuthGuard] },
      { path: 'enter-data/:id', component: EnterDataFormComponent, canActivate: [AuthGuard] },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DataEntryRoutingModule { }
