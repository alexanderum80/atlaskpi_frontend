import { AuthGuard } from '../shared/services/auth-guard.service';
import {
    DeleteAppointmentComponent
} from './delete-appointment/delete-appointment.component';
import {
    AddAppointmentComponent
} from './add-appointment/add-appointment.component';
import {
    AppointmentGuardService
} from './shared/services/appointment-guard.service';
import {
    ListAppointmentComponent
} from './list-appointment/list-appointment.component';
import {
    NgModule
} from '@angular/core';
import {
    Routes,
    RouterModule
} from '@angular/router';
import {
    AppointmentsComponent
} from './appointments.component';


const routes: Routes = [{
    path: 'appointments',
    component: AppointmentsComponent,
    children: [{
            path: 'list',
            component: ListAppointmentComponent,
            canActivate: [AppointmentGuardService, AuthGuard]
        },
        {
            path: 'add',
            component: AddAppointmentComponent,
            canActivate: [AppointmentGuardService]
        },
        {
            path: 'delete',
            component: DeleteAppointmentComponent,
            canActivate: [AppointmentGuardService]
        }
    ]
}];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AppointmentsRoutingModule {}
