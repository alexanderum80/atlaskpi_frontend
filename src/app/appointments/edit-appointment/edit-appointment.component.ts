// Angular Imports
import { CommonService } from '../../shared/services/common.service';
import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import {
    Router,
    ActivatedRoute
} from '@angular/router';

// App Code
import {
    IAppointment
} from '../shared/models/appointment.model';
import {
    AppointmentFormComponent
} from '../appointment-form/appointment-form.component';
import {
    ApolloService
} from '../../shared/services/apollo.service';
import { Subscription } from 'rxjs/Subscription';


// Apollo Queries/Mutations

const appointmentByIdQuery = require('./appointment-by-id.gql');
const editMutation = require('./edit-appointment.gql');

@Component({
    selector: 'kpi-edit-appointment',
    templateUrl: './edit-appointment.component.pug',
    encapsulation: ViewEncapsulation.None
})
export class EditAppointmentComponent implements OnInit, OnDestroy {
    @ViewChild('appointmentForm') private _form: AppointmentFormComponent;

    private _subscription: Subscription[] = [];

    constructor(
        private _route: ActivatedRoute,
        private _router: Router,
        private _apolloService: ApolloService) {}

    ngOnInit() {
        const that = this;

        this._subscription.push(
            this._route.params.subscribe(params => {
                that._getAppointmentInfo(params['id']).then(d => that._form.update(d));
            })
        );
    }

    ngOnDestroy() {
        CommonService.unsubscribe(this._subscription);
    }

    update() {
        const that = this;

        if (this._form.vm.valid) {
            this._apolloService.mutation < IAppointment > (editMutation, this._form.vm.editPayload)
                .then(res => that._router.navigateByUrl('appointments?refresh=true'))
                .catch(err => that._displayServerErrors(err));
        }
    }

    cancel(): void {
        this._router.navigateByUrl('appointments');
    }

    private _getAppointmentInfo(id: string): Promise < IAppointment > {
        return this._apolloService.networkQuery < IAppointment > (appointmentByIdQuery, {
                id: id
            })
            .then(res => res.appointmentById);
    }

    private _displayServerErrors(err) {
        console.log('Server errors: ' + JSON.stringify(err));
    }
}
