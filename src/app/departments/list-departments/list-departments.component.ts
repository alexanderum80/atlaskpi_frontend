import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import SweetAlert from 'sweetalert2';

import { AddDepartmentActivity } from '../../shared/authorization/activities/departments/add-department.activity';
import { DeleteDepartmentActivity } from '../../shared/authorization/activities/departments/delete-department.activity';
import { UpdateDepartmentActivity } from '../../shared/authorization/activities/departments/update-department.activity';
import { ViewDepartmentActivity } from '../../shared/authorization/activities/departments/view-department.activity';
import { Activity } from '../../shared/authorization/decorators/component-activity.decorator';
import { IItemListActivityName } from '../../shared/interfaces/item-list-activity-names.interface';
import { ApolloService } from '../../shared/services/apollo.service';
import { CommonService } from '../../shared/services/common.service';
import { IActionItemClickedArgs } from '../../shared/ui/lists/item-clicked-args';
import { IDepartment } from '../shared/models/department.model';
import { ListDepartmentsViewModel } from './list-departments.viewmodel';


const departmentsQuery = require('graphql-tag/loader!./department.gql');
const delDepartmentMutation = require('graphql-tag/loader!./delete-department.gql');

@Activity(ViewDepartmentActivity)
@Component({
    selector: 'kpi-list-departments',
    templateUrl: './list-departments.component.pug',
    styleUrls: [ './list-departments.component.scss' ],
    providers: [ListDepartmentsViewModel, AddDepartmentActivity, UpdateDepartmentActivity, DeleteDepartmentActivity]
})
export class ListDepartmentsComponent implements OnInit, OnDestroy {

    actionActivityNames: IItemListActivityName = {};
    private _subscription: Subscription[] = [];

    constructor(
        private _apolloService: ApolloService,
        private _router: Router,
        private _route: ActivatedRoute,
        public vm: ListDepartmentsViewModel,
        public addDepartmentActivity: AddDepartmentActivity,
        public updateDepartmentActivity: UpdateDepartmentActivity,
        public deleteDepartmentActivity: DeleteDepartmentActivity) {
            this.actionActivityNames = {
                edit: this.updateDepartmentActivity.name,
                delete: this.deleteDepartmentActivity.name
            };
        }

    ngOnInit() {
        const that = this;

        if (!this.vm.initialized) {
            this.vm.initialize(null);
            this.vm.addActivities([this.addDepartmentActivity, this.updateDepartmentActivity, this.deleteDepartmentActivity]);
            this._refreshDepartments();
        }

        this._subscription.push(this._route.queryParams.subscribe(p => {
            if (p.refresh) {
                that._refreshDepartments();
            }
        }));
    }

    ngOnDestroy() {
        CommonService.unsubscribe(this._subscription);
    }

    add() {
        this._router.navigate(['departments', 'add']);
    }

    actionClicked(args: IActionItemClickedArgs) {
        switch (args.action.id) {
            case 'edit':
                this._edit(args.item.id);
                break;
            case 'delete':
                this._delete(args.item.id, args.item.title);
                break;
        }
    }

    editClickedList($event) {
        if ($event.itemType === 'standard') {
            this._edit($event.item.id);
        }
        return;
    }

    private _edit(id: string) {
        this._router.navigate(['departments', 'edit', id]);
    }

    private _delete(id: string, name: string) {
        const that = this;

        SweetAlert({
                title: 'Are you sure?',
                text: `Once ${name}'s department has been deleted, you will not be able to recover it. Are you sure you want to delete it?`,
                type: 'warning',
                showConfirmButton: true,
                showCancelButton: true
            })
            .then((res) => {
                if (res.value === true) {
                    that._apolloService.mutation < {
                            deleteDepartment: {
                                success: boolean
                            }
                        } > (delDepartmentMutation, {
                            _id: id
                        })
                        .then(result => {
                            if (result.data.deleteDepartment.success) {
                                that._refreshDepartments();
                            }
                        });
                }
            });
    }

    private _refreshDepartments(refresh ?: boolean) {
        const that = this;

        this._apolloService.networkQuery < IDepartment[] > (departmentsQuery).then(d => {
            that.vm.departments = d.departments;
        });
    }
}
