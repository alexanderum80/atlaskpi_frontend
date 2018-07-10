// Angular Imports
import { CommonService } from '../../shared/services/common.service';
import { UpdateEmployeeActivity } from '../../shared/authorization/activities/employees/update-employee.activity';
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
    IEmployee
} from '../shared/models/employee.model';
import {
    EmployeeFormComponent
} from '../employee-form/employee-form.component';
import {
    ApolloService
} from '../../shared/services/apollo.service';
import {
    Subscription
} from 'rxjs/Subscription';


// Apollo Queries/Mutations

const employeeByIdQuery = require('./employee-by-id.gql');
const editMutation = require('./edit-employee.gql');

@Activity(UpdateEmployeeActivity)
@Component({
    selector: 'kpi-edit-employee',
    templateUrl: './edit-employee.component.pug',
    encapsulation: ViewEncapsulation.None
})
export class EditEmployeeComponent implements OnInit, OnDestroy {
    @ViewChild('employeeForm') private _form: EmployeeFormComponent;

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
            that._getEmployeeInfo(params['id']).then(d => {
                that._form.update(d);
            });
        }));
    }

    ngOnDestroy() {
        CommonService.unsubscribe(this._subscription);
    }

    update() {
        const that = this;
        if (this._form.vm.valid) {
            this._apolloService.mutation < IEmployee > (editMutation, this._form.vm.editPayload)
                .then(res => {if (that.refreshRealData === true) {
                    that._router.navigateByUrl('self-boarding-winzard/employee?refreshRealData=true');
                } else  {
                    that._router.navigateByUrl('employees?refresh=true');
                }})
                .catch(err => that._displayServerErrors(err));
        }
    }

    cancel(): void {
        if (this.refreshRealData === true) {
            this._router.navigateByUrl('self-boarding-winzard/employee?refreshRealData=true');
        } else  {
            this._router.navigateByUrl('employees?refresh=true');
        }
    }

    private _getEmployeeInfo(id: string): Promise < IEmployee > {
        return this._apolloService.networkQuery < IEmployee > (employeeByIdQuery, {
                id: id
            })
            .then(res => res.employeeById);
    }

    private _displayServerErrors(err) {
        console.log('Server errors: ' + JSON.stringify(err));
    }
}
