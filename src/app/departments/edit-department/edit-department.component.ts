import { CommonService } from '../../shared/services/common.service';
import { UpdateDepartmentActivity } from '../../shared/authorization/activities/departments/update-department.activity';
import { Activity } from '../../shared/authorization/decorators/component-activity.decorator';
import {
    Router,
    ActivatedRoute
} from '@angular/router';
import {
    IDepartment
} from '../shared/models/department.model';
import {
    FormDepartmentComponent
} from '../form-department/form-department.component';
import {
    ApolloService
} from '../../shared/services/apollo.service';
import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import {
    Subscription
} from 'rxjs/Subscription';


const departmentByIdQuery = require('graphql-tag/loader!./department-by-id.gql');
const editMutation = require('graphql-tag/loader!./update-department.gql');

@Activity(UpdateDepartmentActivity)
@Component({
    selector: 'kpi-edit-department',
    templateUrl: './edit-department.component.pug',
    encapsulation: ViewEncapsulation.None
})
export class EditDepartmentComponent implements OnInit, OnDestroy {
    @ViewChild('departmentForm') private _form: FormDepartmentComponent;

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
            that._getDepartmentInfo(params['id']).then(d => that._form.update(d));
        }));
    }

    ngOnDestroy() {
        CommonService.unsubscribe(this._subscription);
    }

    update() {
        const that = this;

        if (this._form.vm.valid) {
            this._apolloService.mutation < IDepartment > (editMutation, this._form.vm.editPayload)
                .then(res => {
                if (that.refreshRealData === true) {
                    that._router.navigateByUrl('self-boarding-winzard/department?refreshRealData=true')
                } else  {
                    that._router.navigateByUrl('departments?refresh=true')
                }})
                .catch(err => that._displayServerErrors(err));
        }
    }

    cancel(): void {
        if (this.refreshRealData === true) {
            this._router.navigateByUrl('self-boarding-winzard/department?refreshRealData=true')
        } else  {
            this._router.navigateByUrl('departments')
        }
    }

    private _getDepartmentInfo(id: string): Promise < IDepartment > {
        return this._apolloService.networkQuery < IDepartment > (departmentByIdQuery, {
                id: id
            })
            .then(res => res.departmentById);
    }

    private _displayServerErrors(err) {
        console.log('Server errors: ' + JSON.stringify(err));
    }
}
