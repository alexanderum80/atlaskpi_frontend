// Angular Imports
import { IUserInfo } from '../../../shared/models/user';
import { UserService } from '../../../shared/services/user.service';
import { Injectable } from '@angular/core';

import { Field, ViewModel } from '../../../ng-material-components/viewModels';
import { IListItem } from '../../../shared/ui/lists/list-item';
import { ISearchArgs } from '../../../shared/ui/lists/item-list/item-list.component';
import { MenuItem } from '../../../dashboards/shared/models';



// App Code
interface IFilter {
    search: string;
}

@Injectable()
export class SetGoalsViewModel extends ViewModel<IFilter> {
    private _targets: any[];
    private _targetItemList: IListItem[];

    public menuItems:  MenuItem[] = [{
    id: 'more-options',
    icon: 'more-vert',
    children: [{
            id: 'edit',
            title: 'Edit',
            icon: 'edit'
        },
        {
            id: 'delete',
            title: 'Delete',
            icon: 'delete'
        },
        {
            id: 'milestones',
            title: 'Milestones',
            icon: 'assignment'
        }]
    }];

    protected _user: IUserInfo;

    constructor(userService: UserService ) {
        super(userService);
    }

    get target(): any[] {
        return this._targets;
    }

    set targets(list:any[]) {
        if (list === this._targets) {
            return;
        }
        this._targets = list;
        this._targetItemList = this._targets.map(d => {
            return {
                id: d._id,
                imagePath: '/assets/img/targets/target.jpeg',
                title: d.name
            };
        });
    }

    get targetItems(): IListItem[] {
        return this._targetItemList;
    }


    @Field({ type: String })
    search: string;

    initialize(model: IFilter): void {
        this.onInit(model);
    }

}
