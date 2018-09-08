// Angular Imports
import { Injectable } from '@angular/core';

import { MenuItem } from '../../../ng-material-components';
import { Field, ViewModel } from '../../../ng-material-components/viewModels';
import { UserService } from '../../../shared/services/user.service';
import { IListItem } from '../../../shared/ui/lists/list-item';
import { IMilestone } from '../../shared/models/targets.model';
import { ApolloService } from '../../../shared/services/apollo.service';
import { IUser } from '../../../users/shared';

import { filter, clone, split } from 'lodash';

// App Code

interface IFilter {
    search: string;
}

interface IListMilestone {
    id: string;
    imagePath?: string;
    title?: string;
    subtitle?: string;
    editing?: boolean;
    selected?: boolean;
}


@Injectable()
export class ListMiestoneViewModel extends ViewModel<IFilter> {
    private _milestone: IMilestone[] = [];
    private _milestonesItemList: IListMilestone[];
    private _allUsers: IUser[];
    milestone: IMilestone;


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

    get milestoineItems(): IListMilestone[] {
        return this._milestonesItemList;
    }


    selectMilestone(item: IListMilestone) {
        this._milestonesItemList.forEach(t => t.selected = false);
        item.selected = true;
    }

    private _prepareMilestoneListItems() {
        this._milestonesItemList = this._milestone.map(d => ({
            id: d._id ,
            imagePath: './assets/img/milestones/milestone.jpg',
            subtitle: this.getUserName(d.responsible),
            title: d.task,
            editing: false,
        }));
    }

    editMilestone(item: IListMilestone) {
        this._milestonesItemList.forEach(t => t.editing = false);
        item.editing = true;
    }

    noEditMilestone() {
        this._milestonesItemList.forEach(t => t.editing = false);
    }


    private getUserName(responsible) {
        let name = '';
        const users = clone(this._allUsers);
        responsible.forEach(element => {
            const stringSplite = element.split('|');
            for (let i = 0; i < stringSplite.length; i++) {
                const filters = filter(users,  {'_id': stringSplite[i]});
                if (filters.length > 0) {
                    name === '' ?
                    name = filters[0].profile.firstName + ' ' + filters[0].profile.lastName :
                    name = name + ', ' + filters[0].profile.firstName + ' ' + filters[0].profile.lastName;
                }
            }
         });
        return name;
   }


}
