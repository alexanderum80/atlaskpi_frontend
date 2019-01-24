import { UserService } from '../../shared/services/user.service';
import { IUserInfo } from '../../shared/models/user';
import { Injectable } from '@angular/core';

import { Field, ViewModel } from '../../ng-material-components/viewModels';
import { IListItem } from '../../shared/ui/lists/list-item';
import { IFilter } from '../../shared/models/filter.model';
import { IFunnel } from '../shared/models/funnel.model';

@Injectable()
export class ListFunnelViewModel extends ViewModel<IFilter> {
    private _funnels: IFunnel[];
    private _funnelItemList: IListItem[];

    protected _user: IUserInfo;

    constructor(userService: UserService) {
        super(userService);
    }

    @Field({ type: String })
    search: string;

    initialize(model: IFilter): void {
        this.onInit(model);
    }

    get funnels(): IFunnel[] {
        return this._funnels;
    }

    set funnels(list: IFunnel[]) {
        if (list === this._funnels) { return; }

        this._funnels = list;
        this._funnelItemList = this._funnels.map(f => ({
            id: f._id,
            imagePath: '/assets/img/pages/funnel-list-item.svg',
            title: f.name,
        }));
    }

    get funnelItems(): IListItem[] {
        if (!this._funnelItemList || this._funnelItemList.length === 0) {
            return null;
        }
        return this._funnelItemList;
    }

    get listEmpty(): boolean {
        return this._funnels && this._funnels.length === 0;
    }
}
