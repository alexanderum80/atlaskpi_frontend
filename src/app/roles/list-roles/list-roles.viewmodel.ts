// Angular Imports
import { IUserInfo } from '../../shared/models/user';
import { UserService } from '../../shared/services/user.service';
import { Injectable } from '@angular/core';

import { Field, ViewModel } from '../../ng-material-components/viewModels';
import { IRole } from '../shared/role';
import { IListItem } from '../../shared/ui/lists/list-item';
import { ISearchArgs } from '../../shared/ui/lists/item-list/item-list.component';

// App Code
interface IFilter {
    search: string;
}

@Injectable()
export class ListRolesViewModel extends ViewModel<IFilter> {
    private _roles: IRole[];
    private _roleItemList: IListItem[];
    protected _user: IUserInfo;

    constructor(userService: UserService) {
        super(userService);
    }

    get roles(): IRole[] {
        return this._roles;
    }

    set roles(list: IRole[]) {
        if (list === this._roles) {
            return;
        }

        this._roles = list;
        this._roleItemList = this._roles.map(d => {
            return {
                id: d._id,
                imagePath: '/assets/img/roles/roles.png',
                title: d.name,
                extras: {
                    timestamp: d.timestamp
                }
            };
        });
    }

    get roleItems(): IListItem[] {
        return this._roleItemList;
    }


    @Field({ type: String })
    search: string;

    initialize(model: IFilter): void {
        this.onInit(model);
    }

}
