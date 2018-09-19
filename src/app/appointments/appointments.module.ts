import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CalendarModule } from 'angular-calendar';

import { MaterialFormsModule, MaterialUserInterfaceModule } from '../ng-material-components';
import { AddAppointmentComponent } from './add-appointment/add-appointment.component';
import { AppointmentsRoutingModule } from './appointments-routing.module';
import { AppointmentsComponent } from './appointments.component';
import { DeleteAppointmentComponent } from './delete-appointment/delete-appointment.component';
import { FormAppointmentComponent } from './form-appointment/form-appointment.component';
import { ListAppointmentComponent } from './list-appointment/list-appointment.component';
import { AppointmentGuardService } from './shared/services/appointment-guard.service';
import { SidebarCalendarComponent } from './sidebar-calendar/sidebar-calendar.component';
import { SharedModule } from '../shared';
import { AppointmentFormComponent } from './appointment-form/appointment-form.component';
import { EditAppointmentComponent } from './edit-appointment/edit-appointment.component';

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        AppointmentsRoutingModule,
        MaterialFormsModule,
        MaterialUserInterfaceModule,
        ReactiveFormsModule,
        BrowserAnimationsModule,
        CalendarModule.forRoot()
    ],
    providers: [AppointmentGuardService, ],
    declarations: [
        AppointmentsComponent,
        ListAppointmentComponent,
        DeleteAppointmentComponent,
        AddAppointmentComponent,
        FormAppointmentComponent,
        SidebarCalendarComponent,
        AppointmentFormComponent,
        EditAppointmentComponent
    ],
    exports: [
        AppointmentsComponent,
        SidebarCalendarComponent
    ]

})
export class AppointmentsModule { }
