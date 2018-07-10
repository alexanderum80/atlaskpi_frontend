// Angular Imports
import { CommonService } from '../../shared/services/common.service';
import {
    UpdateBusinessUnitActivity,
} from '../../shared/authorization/activities/business-units/update-business-unit.activity';
import { Activity } from '../../shared/authorization/decorators/component-activity.decorator';
import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import {
    Router,
    ActivatedRoute
} from '@angular/router';

// App Code
import {
    IBusinessUnit
} from '../shared/models/business-unit.model';
import {
    BusinessUnitFormComponent
} from '../business-unit-form/business-unit-form.component';
import {
    ApolloService
} from '../../shared/services/apollo.service';
import { Subscription } from 'rxjs/Subscription';

// Apollo Queries/Mutations

const businessUnitByIdQuery = require('graphql-tag/loader!./business-unit-by-id.gql');
const editMutation = require('graphql-tag/loader!./edit-business-unit.gql');

@Activity(UpdateBusinessUnitActivity)
@Component({
    selector: 'kpi-edit-business-unit',
    templateUrl: './edit-business-unit.component.pug',
    encapsulation: ViewEncapsulation.None
})
export class EditBusinessUnitComponent implements OnInit, OnDestroy {
    @ViewChild('businessUnitForm') private _form: BusinessUnitFormComponent;

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
            that._getBusinessUnitInfo(params['id']).then(d => that._form.update(d));
        }));
    }

    ngOnDestroy() {
        CommonService.unsubscribe(this._subscription);
    }

    update() {
        const that = this;

        if (this._form.vm.valid) {
            this._apolloService.mutation < IBusinessUnit > (editMutation, { input: this._form.vm.editPayload })
                .then(res => {if (that.refreshRealData === true) {
                        that._router.navigateByUrl('self-boarding-winzard/business?refreshRealData=true');
                    } else  {
                        that._router.navigateByUrl('business-units?refresh=true');
                    }})
                .catch(err => that._displayServerErrors(err));
        }
    }

    cancel(): void {
        if (this.refreshRealData === true) {
            this._router.navigateByUrl('self-boarding-winzard/business?refreshRealData=true');
        } else  {
            this._router.navigateByUrl('business-units?refresh=true');
        }
    }

    private _getBusinessUnitInfo(id: string): Promise < IBusinessUnit > {
        return this._apolloService.networkQuery < IBusinessUnit > (businessUnitByIdQuery, {
                id: id
            })
            .then(res => res.businessUnitById);
    }

    private _displayServerErrors(err) {
        console.log('Server errors: ' + JSON.stringify(err));
    }
}
