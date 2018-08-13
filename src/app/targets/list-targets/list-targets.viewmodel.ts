// Angular Imports
import { IUserInfo } from '../../shared/models/user';
import { UserService } from '../../shared/services/user.service';
import {
    Injectable
} from '@angular/core';

// App Code
import {
    Field,
    ViewModel
} from '../../ng-material-components/viewModels';
import { IListItem } from '../../shared/ui/lists/list-item';
import { ITargets } from '../shared/models/targets.model';
import { MenuItem } from '../../ng-material-components';
// import { MenuItem } from '../../dashboards/shared/models';


interface IFilter {
    search: string;
}

@Injectable()
export class ListTargetsViewModel extends ViewModel<IFilter> {
    private _targets: ITargets[] = [];
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

    get targets(): ITargets[] {
        return this._targets;
    }

    set targets(list: ITargets[]) {
        if (list === this._targets) {
            return;
        }

        this._targets = list;
        this._targetsItemList = this._targets.map(d => ({
            id: d._id ,
            imagePath: this.getImagen(d.active || true) || '',
            title: d.name || 'Target Name',
            subtitle: d.nextDueDate || Date.now.toString(),
        }));
    }

    @Field({ type: String })
    search: string;

    initialize(model: IFilter): void {
        this.onInit(model);
    }

    get targetItems(): IListItem[] {
        return this._targetsItemList;
    }

    getImagen(active) : string {
        let img = './assets/img/targets/target_t.png';
        active ? img = './assets/img/targets/target_t.png' : img = './assets/img/targets/targe_g_t.png';
        return img;
    }

   
}
