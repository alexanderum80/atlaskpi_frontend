// Angular Imports
import { CommonService } from '../../shared/services/common.service';
import { AddBusinessUnitActivity } from '../../shared/authorization/activities/business-units/add-business-unit.activity';
import { Activity } from '../../shared/authorization/decorators/component-activity.decorator';
import { Component, OnDestroy, ViewChild, ViewEncapsulation } from '@angular/core';
import {
    Router,
    ActivatedRoute
} from '@angular/router';

// App Code
import {
    BusinessUnitFormComponent
} from '../business-unit-form/business-unit-form.component';
import {
    IBusinessUnit
} from '../shared/models/business-unit.model';
import {
    ApolloService
} from '../../shared/services/apollo.service';
import { Subscription } from 'rxjs/Subscription';

// Apollo Mutation

const addMutation = require('graphql-tag/loader!./add-business-unit.gql');

@Activity(AddBusinessUnitActivity)
@Component({
    selector: 'kpi-add-business-unit',
    templateUrl: './add-business-unit.component.pug',
    encapsulation: ViewEncapsulation.None
})
export class AddBusinessUnitComponent implements OnDestroy {
    @ViewChild('businessUnitForm') private _form: BusinessUnitFormComponent;

    refreshRealData: boolean;
    private _subscription: Subscription[] = [];

    constructor(
        private _route: ActivatedRoute,
        private _router: Router,
        private _apolloService: ApolloService) {
        this._subscription.push(
            this._route.queryParams.subscribe(p => {
                if (p.refresh) {
                    this.refreshRealData = true;
                }
            })
        );
    }

    ngOnDestroy() {
        CommonService.unsubscribe(this._subscription);
    }

    save(): void {
        const that = this;

        if (this._form.vm.valid) {
            this._apolloService.mutation < IBusinessUnit > (addMutation, { input: this._form.vm.addPayload })
                .then(res => {
                    if (that.refreshRealData === true) {
                        that._router.navigateByUrl('self-boarding-winzard/business?refreshRealData=true');
                    } else  {
                        that._router.navigateByUrl('business-units?refresh=true');
                    }
                })
                .catch(err => that._displayServerErrors(err));
        }
    }

    cancel(): void {
        if (this.refreshRealData === true) {
            this._router.navigateByUrl('self-boarding-winzard/business?refreshRealData=true');
        } else  {
            this._router.navigateByUrl('business-units');
        }
    }

    private _displayServerErrors(err) {
        console.log('Server errors: ' + JSON.stringify(err));
    }
}
