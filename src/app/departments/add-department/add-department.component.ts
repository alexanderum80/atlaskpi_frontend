import { CommonService } from '../../shared/services/common.service';
import { AddDepartmentActivity } from '../../shared/authorization/activities/departments/add-department.activity';
import { Activity } from '../../shared/authorization/decorators/component-activity.decorator';
import {
    Router, ActivatedRoute
} from '@angular/router';
import {
    FormDepartmentComponent
} from '../form-department/form-department.component';
import {
    ApolloService
} from '../../shared/services/apollo.service';
import { Component, OnDestroy, ViewChild, ViewEncapsulation } from '@angular/core';
import {
    IDepartment
} from '../shared/models/department.model';
import {
    Subscription
} from 'rxjs/Subscription';


const addMutation = require('graphql-tag/loader!./create-department.gql');

@Activity(AddDepartmentActivity)
@Component({
    selector: 'kpi-add-department',
    templateUrl: './add-department.component.pug',
    encapsulation: ViewEncapsulation.None
})
export class AddDepartmentComponent implements OnDestroy {
    @ViewChild('departmentForm') private _form: FormDepartmentComponent;

    refreshRealData: boolean;
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
            this._apolloService.mutation < IDepartment > (addMutation, this._form.vm.addPayload)
                .then(res => {
                    if (that.refreshRealData === true) {
                        that._router.navigateByUrl('self-boarding-winzard/department?refreshRealData=true')
                    } else  {
                        that._router.navigateByUrl('departments?refresh=true')
                    }
                })
                .catch(err => that._displayServerErrors(err));
        }
    }

    cancel(): void {
        if (this.refreshRealData === true) {
            this._router.navigateByUrl('self-boarding-winzard/department?refreshRealData=true')
        } else  {
            this._router.navigateByUrl('departments?refresh=true')
        }
    }

    private _displayServerErrors(err) {
        console.log('Server errors: ' + JSON.stringify(err));
    }
}
