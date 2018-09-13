import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../shared/services';
import { FormTargetsComponent } from './form-targets/form-targets.component';

const routes: Routes = [{
    path: 'targets', component: FormTargetsComponent, canActivate: [ AuthGuard ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TargetsRoutingModule { }
