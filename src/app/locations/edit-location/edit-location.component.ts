// Angular Imports
import { CommonService } from '../../shared/services/common.service';
import { UpdateLocationActivity } from '../../shared/authorization/activities/locations/update-location.activity';
import { Activity } from '../../shared/authorization/decorators/component-activity.decorator';
import {
    Component,
    OnInit,
    ViewChild,
ViewEncapsulation,
OnDestroy
} from '@angular/core';
import {
    Router,
    ActivatedRoute
} from '@angular/router';

// App Code
import {
    ILocation
} from '../shared/models/location.model';
import {
    LocationFormComponent
} from '../location-form/location-form.component';
import {
    ApolloService
} from '../../shared/services/apollo.service';
import {
    Subscription
} from 'rxjs/Subscription';


// Apollo Queries/Mutations

const locationByIdQuery = require('graphql-tag/loader!./location-by-id.gql');
const editLocationMutation = require('graphql-tag/loader!./edit-location.gql');

@Activity(UpdateLocationActivity)
@Component({
    selector: 'kpi-edit-location',
    templateUrl: './edit-location.component.pug',
    encapsulation: ViewEncapsulation.None
})
export class EditLocationComponent implements OnInit, OnDestroy {
    @ViewChild('locationForm') public _form: LocationFormComponent;

    refreshRealData: boolean;
    private _subscription: Subscription[] = [];

    constructor(
        private _route: ActivatedRoute,
        private _router: Router,
        private _apolloService: ApolloService) {}

    ngOnInit() {
        const that = this;

        this._subscription.push(this._route.params.subscribe(params => {
            if (params.refresh) {
                this.refreshRealData = true;
            }
            that._getLocationInfo(params['id']).then(d => that._form.update(d));
        }));
    }

    ngOnDestroy() {
        CommonService.unsubscribe(this._subscription);
    }

    update() {
        const that = this;
        if (this._form.vm.valid) {
            this._apolloService.mutation < ILocation > (editLocationMutation, this._form.vm.addPayload)
                .then(res => {if (that.refreshRealData === true) {
                    that._router.navigateByUrl('self-boarding-winzard/location?refreshRealData=true')
                }else{
                    that._router.navigateByUrl('locations?refresh=true')
                }})
                .catch(err => that._displayServerErrors(err));
        }
    }

    cancel(): void {
        if (this.refreshRealData === true) {
            this._router.navigateByUrl('self-boarding-winzard/location?refreshRealData=true')
        }else{
            this._router.navigateByUrl('locations?refresh=true');
        }
    }

    private _getLocationInfo(id: string): Promise < ILocation > {
        return this._apolloService.networkQuery < ILocation > (locationByIdQuery, {
            id: id
        })
        .then(res => res.locationById);
    }

    private _displayServerErrors(err) {
        console.log('Server errors: ' + JSON.stringify(err));
    }
}
