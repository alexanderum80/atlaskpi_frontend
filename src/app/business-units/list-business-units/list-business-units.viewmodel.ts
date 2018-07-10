// Angular Imports
import { UserService } from '../../shared/services/user.service';
import { IUserInfo } from '../../shared/models/user';
import { Injectable } from '@angular/core';

import { Field, ViewModel } from '../../ng-material-components/viewModels';
import { IBusinessUnit } from '../shared/models/business-unit.model';
import { IListItem } from '../../shared/ui/lists/list-item';

// App Code
interface IFilter {
    search: string;
}

@Injectable()
export class ListBusinessUnitsViewModel extends ViewModel<IFilter> {
    private _businessUnits: IBusinessUnit[];
    private _businessUnitItemList: IListItem[];

    protected _user: IUserInfo;

    constructor(userService: UserService) {
        super(userService);
    }

    get businessUnits(): IBusinessUnit[] {
        return this._businessUnits;
    }

    set businessUnits(list: IBusinessUnit[]) {
        if (list === this._businessUnits) {
            return;
        }

        this._businessUnits = list;
        this._businessUnitItemList = this._businessUnits.map(bu => ({
            id: bu._id,
            imagePath: '/assets/img/pages/business-unit.png',
            title: bu.name,
            subtitle: bu.serviceType
        }));
    }

    get businessUnitItems(): IListItem[] {
        if (!this._businessUnitItemList || this._businessUnitItemList.length === 0) {
            return null;
        }

        return this._businessUnitItemList;
    }

    @Field({ type: String })
    search: string;

    initialize(model: IFilter): void {
        this.onInit(model);
    }

}
