import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FunnelComponent } from './funnel.component';
import { AuthGuard } from '../shared/services';
import { ListFunnelComponent } from './list-funnel/list-funnel.component';

const routes: Routes = [
    {
        path: 'funnel',
        component: FunnelComponent,
        canActivate: [AuthGuard],
        children: [
            {
                path: '',
                redirectTo: '/list',
                pathMatch: 'full',
            },
            {
              path: 'list',
              component: ListFunnelComponent,
              canActivate: [AuthGuard]
            }
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class FunnelRoutingModule {}
