// Angular Imports
import { Injectable } from '@angular/core';

import { MenuItem } from '../../ng-material-components';
import { Field, ViewModel } from '../../ng-material-components/viewModels';
import { IUserInfo } from '../../shared/models/user';
import { UserService } from '../../shared/services/user.service';
import { IListItem } from '../../shared/ui/lists/list-item';
import { ITarget } from '../shared/models/targets.model';

// App Code

interface IFilter {
    search: string;
}

@Injectable()
export class ListTargetsViewModel extends ViewModel<IFilter> {
    private _targets: ITarget[] = [];
    private _targetsItemList: IListItem[];
    protected _user: IUserInfo;

    public menuItems:  MenuItem[] = [{
        id: 'more-options',
        icon: 'more-vert',
        children: [{
                id: 'edit',
                title: 'disable',
                icon: 'notifications-off'
            },
            {
                id: 'delete',
                title: 'Delete',
                icon: 'delete'
            }]
        }];

    constructor(userService: UserService) {
        super(userService);
    }

    get targets(): ITarget[] {
        return this._targets;
    }

    set targets(list: ITarget[]) {
        if (list === this._targets) {
            return;
        }

        this._targets = list;
        this._prepareTargetListItems();
    }

    @Field({ type: String })
    search: string;

    initialize(model: IFilter): void {
        this.onInit(model);
    }

    get targetItems(): IListItem[] {
        return this._targetsItemList;
    }

    getImage(active): string {
        let img = './assets/img/targets/target_t.png';
        active ? img = './assets/img/targets/target_t.png' : img = './assets/img/targets/targe_g_t.png';
        return img;
    }

    selectTarget(item: IListItem) {
        this._targetsItemList.forEach(t => t.selected = false);
        item.selected = true;
    }

    private _prepareTargetListItems() {
        this._targetsItemList = this._targets.map(d => ({
            id: d._id ,
            imagePath: this.getImage(d.active || true) || '',
            title: d.name || 'Target Name',
            subtitle: d.nextDueDate || Date.now.toString(),
        }));
    }

}
