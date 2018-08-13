// Angular Imports
import { IUserInfo } from '../../../shared/models/user';
import { UserService } from '../../../shared/services/user.service';
import {
    Injectable
} from '@angular/core';

// App Code
import {
    Field,
    ViewModel
} from '../../../ng-material-components/viewModels';
import { IListItem } from '../../../shared/ui/lists/list-item';
import { IMilestone } from '../../shared/models/targets.model';
import { MenuItem } from '../../../ng-material-components';


interface IFilter {
    search: string;
}

@Injectable()
export class ListMilestoneViewModel extends ViewModel<IFilter> {
    private _milestone: IMilestone[] = [];
    private _milestoneItemList: IListItem[];
    protected _user: IUserInfo;

    public menuItems:  MenuItem[] = [{
        id: 'more-options',
        icon: 'more-vert',
        children: [{
                id: 'decline',
                title: 'Decline',
                icon: 'close-cicle'
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

    constructor(userService: UserService) {
        super(userService);
    }

    get mileston(): IMilestone[] {
        return this._milestone;
    }

    set milestone(list: IMilestone[]) {
        if (list === this._milestone) {
            return;
        }

        this._milestone = list;
        this._milestoneItemList = this._milestone.map(d => ({
            id: d.description ,
            imagePath: './assets/img/milestones/milestone.jpg',
            title: d.description,
            subtitle: d.responsiblePeople,
        }));
    }

    @Field({ type: String })
    search: string;

    initialize(model: IFilter): void {
        this.onInit(model);
    }

    get milestoneItems(): IListItem[] {
        return this._milestoneItemList;
    }
   
}
