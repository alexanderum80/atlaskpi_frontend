// Angular Imports
import { Injectable } from '@angular/core';

import { MenuItem } from '../../../ng-material-components';
import { Field, ViewModel } from '../../../ng-material-components/viewModels';
import { UserService } from '../../../shared/services/user.service';
import { IListItem } from '../../../shared/ui/lists/list-item';
import { IMilestone } from '../../shared/models/targets.model';
import { ApolloService } from '../../../shared/services/apollo.service';
import { IUser } from '../../../users/shared';

import { filter } from 'lodash';

// App Code

interface IFilter {
    search: string;
}



@Injectable()
export class ListMiestoneViewModel extends ViewModel<IFilter> {
    private _milestone: IMilestone[] = [];
    private _milestonesItemList: IListItem[];
    private _allUsers: IUser[];

    public menuItems:  MenuItem[] = [{
        id: 'more-options',
        icon: 'more-vert',
        children: [{
            id: 'declined',
            title: 'Declined',
            icon: 'close-circle'
        },
        {
            id: 'complited',
            title: 'Complited',
            icon: 'check'
        }, {
                id: 'edit',
                title: 'Edit',
                icon: 'edit'
            },
            {
                id: 'delete',
                title: 'Delete',
                icon: 'delete'
            }]
        }];

    constructor(userService: UserService, private _apolloService: ApolloService) {
        super(userService);
    }

    get milestones(): IMilestone[] {
        return this._milestone;
    }

    set milestones(list: IMilestone[]) {
        if (list === this._milestone) {
            return;
        }

        this._milestone = list;
        this._prepareMilestoneListItems();
    }

    set allUsers(list: IUser[]) {
        if (list === this._allUsers) {
            return;
        }
        this._allUsers = list;
    }

    @Field({ type: String })
    search: string;

    initialize(model: IFilter): void {
        this.onInit(model);
    }

    get milestoineItems(): IListItem[] {
        return this._milestonesItemList;
    }


    selectMilestone(item: IListItem) {
        this._milestonesItemList.forEach(t => t.selected = false);
        item.selected = true;
    }

    private _prepareMilestoneListItems() {
        this._milestonesItemList = this._milestone.map(d => ({
            id: d._id ,
            imagePath: './assets/img/milestones/milestone.jpg',
            title: d.task,
            subtitle: this.getUserName(d.responsible),
        }));
    }

    private getUserName(responsible) {
        let allUser = [];
        let name = '';
        responsible.forEach(element => {
             const filters = filter(this._allUsers,  {'_id': element});
             name === '' ?
                name = filters[0].profile.firstName + ' ' + filters[0].profile.lastName :
                name = name + ', ' + filters[0].profile.firstName + ' ' + filters[0].profile.lastName;
             allUser.push(name);
         });
        return String(allUser);
   }


}
