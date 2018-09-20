import { WidgetsComponent } from './widgets.component';
import {
    EmptyWidgetListComponent
} from './empty-widget-list/empty-widget-list.component';
import {
    NgModule
} from '@angular/core';
import {
    Routes,
    RouterModule
} from '@angular/router';
import {
    NewWidgetComponent
} from './new-widget/new-widget.component';

const routes: Routes = [{
        path: 'widgets2',
        component: WidgetsComponent,
        children: [{
                path: 'empty',
                component: EmptyWidgetListComponent
            },
            {
                path: 'new',
                component: NewWidgetComponent
            }
        ]
    }

];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class Widgets2RoutingModule {}