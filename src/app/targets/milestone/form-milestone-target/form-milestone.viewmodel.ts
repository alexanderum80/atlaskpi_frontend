import { Injectable } from '@angular/core';
import { ViewModel } from '../../../ng-material-components/viewModels/view-model';
import { Field, ArrayField } from '../../../ng-material-components/viewModels';
import { IMilestone } from '../../shared/models/targets.model';
import { SelectionItem } from '../../../ng-material-components';
import { IListItem } from '../../../shared/ui/lists/list-item';
import { IUserInfo, User } from '../../../shared/models';
import { MenuItem } from '../../../ng-material-components';
import * as moment from 'moment';



@Injectable()
export class FormMilestoneViewModel extends ViewModel<IMilestone> {

    responsibleList: SelectionItem[] = [];

    statusList: SelectionItem[];

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
    target: string;

    @Field({ type:String,  required: true })
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
        if(List === this.responsibleList) {
            return;
        }
        this.responsibleList = List;
    }

}

