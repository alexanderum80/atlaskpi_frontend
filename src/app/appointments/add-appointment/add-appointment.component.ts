import { CommonService } from '../../shared/services/common.service';
import { RouterConfigLoader } from '@angular/router/src/router_config_loader';
import {
    Appointment,
    IAppointment
} from '../shared/models/appointment.model';
import {
    FormControl,
    FormGroup,
    RequiredValidator,
    Validator,
    Validators
} from '@angular/forms';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';


const CreateAppointment = require('graphql-tag/loader!./create-appointment.gql');

@Component({
    selector: 'kpi-add-appointment',
    templateUrl: './add-appointment.component.pug',
    styleUrls: ['./add-appointment.component.scss']
})
export class AddAppointmentComponent implements OnInit, OnDestroy {
    fg: FormGroup;
    appointment: IAppointment;

    private _subscription: Subscription[] = [];

    constructor(private _apollo: Apollo, private route: Router) {

    }

    ngOnInit() {
        const that = this;

        this.fg = new FormGroup({
            'date': new FormControl('', [Validators.required]),
            'name': new FormControl('', [Validators.required]),
            'description': new FormControl('', [Validators.required])
        });

        this._subscription.push(
            this.fg.valueChanges.subscribe(appointment => {
                that.appointment = Appointment.Create(
                    null,
                    appointment.name,
                    appointment.date,
                    appointment.description
                );
            })
        );
    }

    ngOnDestroy() {
        CommonService.unsubscribe(this._subscription);
    }

    save() {
        this._apollo.mutate({
            mutation: CreateAppointment,
            variables: { input: this.appointment }
        });
        this.route.navigate(['/appointments/list']) ;
    }

}
