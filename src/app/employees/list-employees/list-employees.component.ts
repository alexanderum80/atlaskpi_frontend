// Angular imports
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import SweetAlert from 'sweetalert2';

import { AddEmployeeActivity } from '../../shared/authorization/activities/employees/add-employee.activity';
import { DeleteEmployeeActivity } from '../../shared/authorization/activities/employees/delete-employee.activity';
import { UpdateEmployeeActivity } from '../../shared/authorization/activities/employees/update-employee.activity';
import { ViewEmployeeActivity } from '../../shared/authorization/activities/employees/view-employee.activity';
import { Activity } from '../../shared/authorization/decorators/component-activity.decorator';
import { IItemListActivityName } from '../../shared/interfaces/item-list-activity-names.interface';
import { ApolloService } from '../../shared/services/apollo.service';
import { CommonService } from '../../shared/services/common.service';
import { IActionItemClickedArgs } from '../../shared/ui/lists/item-clicked-args';
import { IEmployee } from '../shared/models/employee.model';
import { ListEmployeesViewModel } from './list-employees.viewmodel';

// External Libraries
// App Code
// Apollo Query/Mutations

const employeesQuery = require('./employees.gql');
const deleteEmployeeMutation = require('./delete-employee.gql');

@Activity(ViewEmployeeActivity)
@Component({
    selector: 'kpi-list-employees',
    templateUrl: './list-employees.component.pug',
    providers: [ListEmployeesViewModel, AddEmployeeActivity, UpdateEmployeeActivity, DeleteEmployeeActivity]
})
export class ListEmployeesComponent implements OnInit, OnDestroy {
    private _subscription: Subscription[] = [];
    
    actionActivityNames: IItemListActivityName = {};
    

    constructor(
        private _apolloService: ApolloService,
        private _router: Router,
        private _route: ActivatedRoute,
        public vm: ListEmployeesViewModel,
        public addEmployeeActivity: AddEmployeeActivity,
        public updateEmployeeActivity: UpdateEmployeeActivity,
        public deleteEmployeeActivity: DeleteEmployeeActivity) {
            this.actionActivityNames = {
                edit: this.updateEmployeeActivity.name,
                delete: this.deleteEmployeeActivity.name
            };
        }

    ngOnInit() {
        const that = this;

        if (!this.vm.initialized) {
            this.vm.initialize(null);
            this.vm.addActivities([this.addEmployeeActivity, this.updateEmployeeActivity, this.deleteEmployeeActivity]);
            this._refreshEmployees();
        }

        this._subscription.push(this._route.queryParams.subscribe(p => {
            if (p.refresh) {
                that._refreshEmployees();
            }
        }));
    }

    ngOnDestroy() {
        CommonService.unsubscribe(this._subscription);
    }

    add() {
        this._router.navigate(['employees', 'add']);
    }

    actionClicked(item: IActionItemClickedArgs) {
        switch (item.action.id) {
            case 'edit':
                this.edit(item.item.id);
                break;
            case 'delete':
                this.delete(item.item.id);
                break;
        }
    }

    editClickedList($event) {
        if ($event.itemType === 'standard') {
            this.edit($event.item.id);
        }
        return;
    }

    edit(employeeId) {
        this._router.navigate(['employees', 'edit', employeeId]);
    }

    delete(employeeId) {
        const that = this;

        SweetAlert({
                title: 'Are you sure?',
                text: 'Once deleted, you will not be able to recover this employee',
                type: 'warning',
                showConfirmButton: true,
                showCancelButton: true
            })
            .then((res) => {
                if (res.value === true) {
                    that._apolloService.mutation < {
                            deleteEmployee: {
                                success: boolean
                            }
                        } > (deleteEmployeeMutation, {
                            id: employeeId
                        })
                        .then(result => {
                            if (result.data.deleteEmployee.success) {
                                that._refreshEmployees();
                            }
                        });
                }
            });
    }

    private _refreshEmployees(refresh ? : boolean) {
        const that = this;

        this._apolloService.networkQuery < IEmployee[] > (employeesQuery).then(d => {
            that.vm.employees = d.employees;
        });
    }
}
