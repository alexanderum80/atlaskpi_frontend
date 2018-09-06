import { Injectable } from '@angular/core';
import { ViewModel } from '../../../ng-material-components/viewModels/view-model';
import { Field, ArrayField } from '../../../ng-material-components/viewModels';
import { IMilestone } from '../../shared/models/targets.model';
import { SelectionItem } from '../../../ng-material-components';
import { IListItem } from '../../../shared/ui/lists/list-item';
import { IUserInfo, User } from '../../../shared/models';
import { MenuItem } from '../../../ng-material-components';
import * as moment from 'moment';
import { clone, filter } from 'lodash';
import { IUser } from '../../../users/shared';
import { RouteReuseStrategy } from '@angular/router';



@Injectable()
export class FormMilestoneViewModel extends ViewModel<IMilestone> {
    private _allUsers: IUser[];

    statusList: SelectionItem[] = [{
        id: 'due', title: 'due', selected: false, disabled: false
      }, {
        id: 'completed', title: 'completed', selected: false, disabled: false
      }, {
        id: 'declined', title: 'declined', selected: false, disabled: false
      }];

    responsibleList: SelectionItem[] = [];

    noneSelectText: any;

    public menuItemsMilestone:  MenuItem[] = [{
        id: 'more-options',
        icon: 'more-vert',
        children: [{
                id: 'decline',
                title: 'Decline',
                icon: 'close-circle'
            },
            {
                id: 'completed',
                title: 'Completed',
                icon: 'check'
            } , {
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

    constructor() {
        super(null);
    }

    @Field({ type: String, required: true })
    task: string;

    @Field({ type: String })
    target?: string;

    @Field({ type: String,  required: true })
    dueDate: string ;

    @Field({ type: String,  required: true  })
    responsible:  string ;


    @Field({ type: String })
    status:  string ;

    initialize(model: any): void {
        this.onInit(model);
    }

    get addPayload() {
        const value = this.modelValue;
        return {
            task: value.task,
            target: value.target ,
            dueDate: value.dueDate,
            status: value.status || '',
            responsible: [value.responsible]
        };
    }

    get editPayload() {
        const value = this.addPayload as any;
        value.id = this._id;

        return value;
    }

    getReposibleList(List: SelectionItem[]) {
        this.noneSelectText = this.getUserName(this.responsible);
        if (List === this.responsibleList) {
            return;
        }
        this.responsibleList = List;
    }

    set allUsers(list: IUser[]) {
        if (list === this._allUsers) {
            return;
        }
        this._allUsers = list;
    }

    private getUserName(responsible) {
        if (!responsible) {
            return '';
        }

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

