import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { Subscription } from 'rxjs/Subscription';
import SweetAlert from 'sweetalert2';

import { ModalComponent } from '../../ng-material-components';
import { AddRoleActivity } from '../../shared/authorization/activities/roles/add-role.activity';
import { DeleteRoleActivity } from '../../shared/authorization/activities/roles/delete-role.activity';
import { ModifyRoleActivity } from '../../shared/authorization/activities/roles/modify-role.activity';
import { Activity } from '../../shared/authorization/decorators/component-activity.decorator';
import { IItemListActivityName } from '../../shared/interfaces/item-list-activity-names.interface';
import { ApolloService } from '../../shared/services/apollo.service';
import { CommonService } from '../../shared/services/common.service';
import { IActionItemClickedArgs } from '../../shared/ui/lists/item-clicked-args';
import { AddRoleComponent } from '../add-role/add-role.component';
import { EditRoleComponent } from '../edit-role/edit-role.component';
import { RoleModel } from '../shared/models/role.model';
import { IRole } from '../shared/role';
import { RolesService } from '../shared/services/roles.service';
import { ListRolesViewModel } from './list-roles.viewmodel';

const rolesQuery = require('./graphql/read-roles.graphql');

@Activity(ModifyRoleActivity)
@Component({
    selector: 'kpi-list-roles',
    templateUrl: './list-roles.component.pug',
    styleUrls: ['./list-roles.component.scss'],
    providers: [RolesService, ListRolesViewModel, AddRoleActivity, ModifyRoleActivity, DeleteRoleActivity]
})
export class ListRolesComponent implements OnInit, OnDestroy {
    @ViewChild(EditRoleComponent) editRoleComponent: EditRoleComponent;
    @ViewChild('removeRoleModal') removeRoleModal: ModalComponent;
    @ViewChild('roleUsedModal') roleUsedModal: ModalComponent;
    @ViewChild('tableContainer') tableContainer: ElementRef;
    @ViewChild('rolesTable') rolesTable: any;
    @ViewChild(AddRoleComponent) addRoleComponent: AddRoleComponent;


    actionActivityNames: IItemListActivityName = {};

    role: IRole[];
    locateRoles: IRole[];

    roleModel: RoleModel;
    roleId: string;

    checkRole: any;

    selected: string;
    output: string;
    backdropOptions: [true, false, 'static'];
    cssClass: '';
    animation = true;
    keyboard = true;
    backdrop = true;
    css = false;

    tableHeight;
    searchString: string;

  private _subscription: Subscription[] = [];


    constructor(
        private _rolesService: RolesService,
        private _apolloService: ApolloService,
    private _apollo: Apollo,
        private _router: Router,
        private _route: ActivatedRoute,
        public vm: ListRolesViewModel,
        public addRoleActivity: AddRoleActivity,
        public updateRoleActivity: ModifyRoleActivity,
        public deleteRoleActivity: DeleteRoleActivity
    ) {
        this.actionActivityNames = {
            edit: this.updateRoleActivity.name,
            delete: this.deleteRoleActivity.name
        };

    }

    ngOnInit() {
        const that = this;
        if (!this.vm.initialized) {
            this.vm.initialize(null);
            this.vm.addActivities([this.addRoleActivity, this.updateRoleActivity, this.deleteRoleActivity]);
            this._refreshRoles();
        }

        this._route.queryParams.subscribe(p => {
            if (p.refresh) {
                that._refreshRoles();
            }
        });
    }

  ngOnDestroy() {
    CommonService.unsubscribe(this._subscription);
  }


    add(): void {
        this.addRoleComponent.open();
    }


    actionClicked(item: IActionItemClickedArgs) {
        switch (item.action.id) {
            case 'edit':
                this.edit(item.item.id);
                break;
            case 'delete':
                this.removeRole(item.item.id);
                break;
        }
    }

    editClickedList($event) {
        if ($event.itemType === 'standard') {
            this.edit($event.item.id);
        }
        return;
    }

    edit(id): void {
        const that = this;
        this._apolloService.networkQuery < IRole[] > (rolesQuery).then(d => {
            that.role = d.findAllRoles.forEach(element => {
                if (element._id === id) {
                    if (!element) {
                        return;
                    }
                    this.roleModel = RoleModel.Create(element);

                    if (this.roleModel) {
                        this.editRoleComponent.getSelectedRole(element);
                        this.editRoleComponent.open();
                    }
                }
            });

        });
    }

    removeRole(id: string): void {
        if (!id) {
            return;
        }
        this.roleId = id;
        this.removeRoleModal.open();
    }

    confirmRoleRemove(): void {
        const that = this;

        this._rolesService.deleteRole(this.roleId).subscribe(({
            data
        }) => {
            const roleResult = ( < any > data).removeRole;
            that.removeRoleModal.close();

            if (!roleResult.success && roleResult.errors.length) {
                that.checkRole = {
                    error: roleResult.errors[0].errors[0],
                    users: roleResult.entity.map(e => e.name)
                };

                that.roleUsedModal.open();
            }
        });
    }

    cancelRoleRemove(): void {
        this.removeRoleModal.close();
    }

    closeRoleInfo(): void {
        this.roleUsedModal.close();
    }

    roleUsed() {
        // do nothing
    }

    private delete(id) {
        if (!id) {
            return;
        }
        this.roleId = id;
        const that = this;
        SweetAlert({
                title: 'Are you sure?',
                text: 'Once deleted, you will not be able to recover this role',
                type: 'warning',
                showConfirmButton: true,
                showCancelButton: true
            })
            .then((res) => {
                if (res.value === true) {
                    this.removeRole(id);
                }
            });
    }

    private _refreshRoles(refresh ?: boolean) {
        const that = this;

    this._subscription.push(
      this._apollo.watchQuery({
        query: rolesQuery,
        fetchPolicy: 'network-only'
      })
      .valueChanges
      .subscribe(({ data }) => {
        that.vm.roles = (data as any).findAllRoles;
      })
    );
  }

}
