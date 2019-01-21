import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FunnelComponent } from './funnel.component';
import { AuthGuard } from '../shared/services';
import { ListFunnelComponent } from './list-funnel/list-funnel.component';
import { ShowFunnelComponent } from './show-funnel/show-funnel.component';
import { NewFunnelComponent } from './new-funnel/new-funnel.component';

const routes: Routes = [
    {
        path: 'funnels',
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
            },
            {
                path: 'new',
                component: NewFunnelComponent,
                canActivate: [AuthGuard]
            },

            {
                path: ':id',
                component: ShowFunnelComponent,
                canActivate: [AuthGuard]
            },

        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class FunnelRoutingModule {}
