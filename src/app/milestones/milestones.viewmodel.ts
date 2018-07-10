// Angular Imports
import { IUserInfo } from '../shared/models/user';
import { UserService } from '../shared/services/user.service';
import { Injectable } from '@angular/core';
import { Field, ViewModel } from '../ng-material-components/viewModels';
import { IMilestone } from './shared/milestones.interface';
import { IListItem } from '../shared/ui/lists/list-item';
import { ISearchArgs } from '../shared/ui/lists/item-list/item-list.component';
import { MilestoneService } from './shared/services/milestone.service';
import {MenuItem} from '../ng-material-components';
// App Code
interface IFilter {
    search: string;
}


@Injectable()
export class MilestonesViewModel extends ViewModel<IFilter> {
    private _milestones: IMilestone[];
    private _milestoneItemList: IListItem[];
    protected _user: IUserInfo;

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
                title: 'Remove',
                icon: 'close'
            },
            {
                id: 'see-target',
                title: 'See Target',
                icon: 'gps-dot'
            }]
        }];

    constructor(userService: UserService) {
        super(userService);
    }

    get milestones(): IMilestone[] {
        return this._milestones;
    }

    set milestones(list: IMilestone[]) {
        if (list === this._milestones) {
            return;
        }
        this._milestones = list;
        this._milestoneItemList = this._milestones.map(m => ({
                id: m._id,
                imagePath: '/assets/img/milestones/milestone.jpg',
                title: m.task,
                subtitle: m.status,
                extras: {
                    dueDate: m.dueDate
                }
            }));
    }

    get milestoneItems(): IListItem[] {
        return this._milestoneItemList;
    }


    @Field({ type: String })
    search: string;

    initialize(model: IFilter): void {
        this.onInit(model);
    }

}
