import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { Subscription } from 'rxjs/Subscription';
import SweetAlert from 'sweetalert2';

import { AddUserActivity } from '../../shared/authorization/activities/users/add-user.activity';
import { DeleteUserActivity } from '../../shared/authorization/activities/users/delete-user.activity';
import { UpdateUserActivity } from '../../shared/authorization/activities/users/update-user.activity';
import { ViewUserActivity } from '../../shared/authorization/activities/users/view-user.activity';
import { Activity } from '../../shared/authorization/decorators/component-activity.decorator';
import { IItemListActivityName } from '../../shared/interfaces/item-list-activity-names.interface';
import { ApolloService } from '../../shared/services/apollo.service';
import { CommonService } from '../../shared/services/common.service';
import { IActionItemClickedArgs } from '../../shared/ui/lists/item-clicked-args';
import { AddUserComponent } from '../add-user';
import { EditUserComponent } from '../edit-user';
import { IManageUsers } from '../shared/models';
import { ListUsersViewModel } from './list-users.viewmodel';

const usersQuery = require('../shared/graphql/get-all-users.gql');
const deleteUserMutation = require('../shared/graphql/remove-user.gql');

@Activity(ViewUserActivity)
@Component({
    selector: 'kpi-list-users',
    templateUrl: './list-users.component.pug',
    styleUrls: ['./list-users.component.scss'],
    providers: [ListUsersViewModel, AddUserActivity, UpdateUserActivity, DeleteUserActivity]
})
export class ListUsersComponent implements OnInit, OnDestroy {
    actionActivityNames: IItemListActivityName = {};


    @ViewChild(AddUserComponent) addUserComponent: AddUserComponent;
    @ViewChild(EditUserComponent) editUserComponent: EditUserComponent;

    user: IManageUsers;
    private _subscription: Subscription[] = [];

    constructor(private _apolloService: ApolloService,
                private _apollo: Apollo,
                private _route: ActivatedRoute,
                public vm: ListUsersViewModel,
                public addUserActivity: AddUserActivity,
                public updateUserActivity: UpdateUserActivity,
                public deleteUserActivity: DeleteUserActivity) {
                    this.actionActivityNames = {
                        edit: this.updateUserActivity.name,
                        delete: this.deleteUserActivity.name
                    };
    }

    ngOnInit() {
        const that = this;
        if (!this.vm.initialized) {
            this.vm.initialize(null);
            this.vm.addActivities([this.addUserActivity, this.updateUserActivity, this.deleteUserActivity]);
            this._refreshUsers();
        }

        this._subscription.push(
            this._route.queryParams.subscribe(p => {
                if (p.refresh) {
                    that._refreshUsers();
                }
            })
        );
    }

    ngOnDestroy() {
        CommonService.unsubscribe(this._subscription);
    }

    add(): void {
        this.addUserComponent.open();
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

    private edit(id) {
        const that = this;
        if (!id) {
            return;
        }
        this._apolloService.networkQuery < IManageUsers[] > (usersQuery).then(u => {
            that.user = u.allUsers.map(element => {
                if (element._id === id) {
                if (!element) { return; }
                this.editUserComponent.getSelectedUser(element);
                this.editUserComponent.open();

                }
            });
        });
    }

    private delete(id) {
        const that = this;
        SweetAlert({
                title: 'Are you sure?',
                text: 'Once deleted, you will not be able to recover this user',
                type: 'warning',
                showConfirmButton: true,
                showCancelButton: true
            })
            .then((res) => {
                if (res.value === true) {
                    that._apolloService.mutation < {
                            deleteUser: {
                                success: boolean
                            }
                        } > (deleteUserMutation, {
                            id: id
                        })
                        .then(result => {
                            that._refreshUsers();
                        });
                }
            });
    }

    private _refreshUsers(refresh ?: boolean) {
        const that = this;

        this._subscription.push(
            this._apollo.watchQuery({
                query: usersQuery,
                fetchPolicy: 'network-only'
            })
            .valueChanges
            .subscribe(({ data }) => {
                that.vm.users = (data as any).allUsers.filter(user => user.roles.find(role => role.name !== 'owner'));
            })
        );
    }
}
