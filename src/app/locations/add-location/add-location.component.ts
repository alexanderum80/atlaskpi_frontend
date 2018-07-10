// Angular Imports
import { CommonService } from '../../shared/services/common.service';
import { AutoUnsubscribe } from '../../data-source/shared/auto-unsubscribe';
import { AddLocationActivity } from '../../shared/authorization/activities/locations/add-location.activity';
import { Activity } from '../../shared/authorization/decorators/component-activity.decorator';
import { Component, OnDestroy, ViewChild, ViewEncapsulation } from '@angular/core';
import {
    Router, ActivatedRoute
} from '@angular/router';

// App Code
import {
    LocationFormComponent
} from '../location-form/location-form.component';
import {
    ILocation
} from '../shared/models/location.model';
import {
    ApolloService
} from '../../shared/services/apollo.service';
import {
    Subscription
} from 'rxjs/Subscription';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { LocationFormViewModel, OperationHoursViewModel } from '../location-form/location-form.viewmodel';

// Apollo Mutation

const addLocationMutation = require('graphql-tag/loader!./create-location.gql');

@Activity(AddLocationActivity)
@Component({
    selector: 'kpi-add-location',
    templateUrl: './add-location.component.pug',
    styleUrls: ['./add-location.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class AddLocationComponent implements OnDestroy {
    @ViewChild('locationForm') public _form: LocationFormComponent;

    refreshRealData = false;
    private _subscription: Subscription[] = [];

    constructor(
        private _route: ActivatedRoute,
        private _router: Router,
        private _apolloService: ApolloService) {
            this._subscription.push(this._route.queryParams.subscribe(p => {
                if (p.refresh) {
                    this.refreshRealData = true;
                }
            }));
    }

    ngOnDestroy() {
        CommonService.unsubscribe(this._subscription);
    }

    save(): void {
        const that = this;
        if (this._form.vm.valid) {
            this._apolloService.mutation < ILocation > (addLocationMutation, this._form.vm.addPayload)
                .then(res => { if (that.refreshRealData === true) {
                    that._router.navigateByUrl('self-boarding-winzard/location?refreshRealData=true');
                } else  {
                    that._router.navigateByUrl('locations?refresh=true');
                }})
                .catch(err => that._displayServerErrors(err));
        }
    }

    cancel(): void {
        if (this.refreshRealData === true) {
            this._router.navigateByUrl('self-boarding-winzard/location?refreshRealData=true')
        }else{
            this._router.navigateByUrl('locations?refresh=true')
        }
    }

    private _displayServerErrors(err) {
        console.log('Server errors: ' + JSON.stringify(err));
    }
}
