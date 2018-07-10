// Angular Imports
import { UserService } from '../../shared/services/user.service';
import { IUserInfo } from '../../shared/models/user';
import { Injectable } from '@angular/core';

import { Field, ViewModel } from '../../ng-material-components/viewModels';
import { ILocation } from '../shared/models/location.model';
import { IListItem } from '../../shared/ui/lists/list-item';

// App Code
interface IFilter {
    search: string;
}

@Injectable()
export class ListLocationsViewModel extends ViewModel<IFilter> {
    private _locations: ILocation[];
    private _locationItemList: IListItem[];

    protected _user: IUserInfo;

    constructor(userService: UserService) {
        super(userService);
    }

    get locations(): ILocation[] {
        return this._locations;
    }

    set locations(list: ILocation[]) {
        if (list === this._locations) {
            return;
        }

        this._locations = list;
        this._locationItemList = this._locations.map(l => ({
            id: l._id,
            imagePath: '/assets/img/pages/location.png',
            title: l.name,
            subtitle: l.description,
            extras: l.city
        }));
    }

    get locationItems(): IListItem[] {
        if (!this._locationItemList || this._locationItemList.length === 0) {
            return null;
        }

        return this._locationItemList;
    }

    @Field({ type: String })
    search: string;

    initialize(model: IFilter): void {
        this.onInit(model);
    }
}
