// Angular Imports
import { IUserInfo } from '../../shared/models/user';
import { UserService } from '../../shared/services/user.service';
import { Injectable } from '@angular/core';
import { Field, ViewModel } from '../../ng-material-components/viewModels';
import { IManageUsers } from '../shared/models/user';
import { IListItem } from '../../shared/ui/lists/list-item';
import { ISearchArgs } from '../../shared/ui/lists/item-list/item-list.component';

// App Code
interface IFilter {
    search: string;
}

@Injectable()
export class ListUsersViewModel extends ViewModel<IFilter> {
    private _users: IManageUsers[];
    private _userItemList: IListItem[];
    

constructor(userService: UserService) {
        super(userService);
    }

    get users(): IManageUsers[] {
        return this._users;
    }
    

    set users(list: IManageUsers[]) {
        if (list === this._users) {
            return;
        }
        this._users = list;
        this._userItemList = this._users.map(u => ({
            id: u._id,
            imagePath: '/assets/img/users/users.png',
            title: u.profile.firstName + ' ' + u.profile.lastName,
            subtitle: this.roleUser(u),
            extras: u.timestamps
        }));
    }
    get userItems(): IListItem[] {
        return this._userItemList;
    }

    roleUser(user){
       return  user.roles ? user.roles.map(r => (r.name + " ")): null
    }

    @Field({ type: String })
    search: string;

    initialize(model: IFilter): void {
        this.onInit(model);
    }
}
