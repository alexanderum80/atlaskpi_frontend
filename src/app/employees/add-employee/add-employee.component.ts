// Angular Imports
import { CommonService } from '../../shared/services/common.service';
import { AddEmployeeActivity } from '../../shared/authorization/activities/employees/add-employee.activity';
import { Activity } from '../../shared/authorization/decorators/component-activity.decorator';
import { Component, OnDestroy, ViewChild, ViewEncapsulation } from '@angular/core';
import {
    Router, ActivatedRoute
} from '@angular/router';

// App Code
import {
    EmployeeFormComponent
} from '../employee-form/employee-form.component';
import {
    IEmployee
} from '../shared/models/employee.model';
import {
    ApolloService
} from '../../shared/services/apollo.service';
import {
    Subscription
} from 'rxjs/Subscription';

// Apollo Mutation

const addMutation = require('graphql-tag/loader!./add-employee.gql');

@Activity(AddEmployeeActivity)
@Component({
    selector: 'kpi-add-employee',
    templateUrl: './add-employee.component.pug',
    encapsulation: ViewEncapsulation.None
})
export class AddEmployeeComponent implements OnDestroy {
    @ViewChild('employeeForm') private _form: EmployeeFormComponent;

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
            this._apolloService.mutation < IEmployee > (addMutation, this._form.vm.addPayload)
                .then(res => {
                    if (that.refreshRealData === true) {
                        that._router.navigateByUrl('self-boarding-winzard/employee?refreshRealData=true')
                    } else  {
                        that._router.navigateByUrl('employees?refresh=true')
                    }
                })
                .catch(err => that._displayServerErrors(err));
        }
    }

    cancel(): void {
        if (this.refreshRealData === true) {
            this._router.navigateByUrl('self-boarding-winzard/employee?refreshRealData=true')
        } else  {
            this._router.navigateByUrl('employees?refresh=true')
        }
    }

    private _displayServerErrors(err) {
        console.log('Server errors: ' + JSON.stringify(err));
    }
}
