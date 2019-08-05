import { ViewModel } from '../../ng-material-components/viewModels/view-model';
import { UserService } from '../../shared/services/user.service';
import { Injectable } from '@angular/core';
import { MenuItem } from 'src/app/ng-material-components';

@Injectable()
export class SideBarViewModel extends ViewModel<any> {

    private _countDashboardsNotVisibles = 0;
    private _countDataEntriesNotVisibles = 0;
    private _list_Item: any = {};
    private _listDashboard =
    {
        id: 'list-dashboard',
        title: 'List Dashboard',
        icon: 'collection-text',
        route: `/dashboards/list`,
        visible: true,
        active: false
    } ;

    private _customListDataEntry =
    {
        id: 'custom-lists',
        title: 'Custom Lists',
        icon: 'storage',
        route: 'data-entry/custom-lists',
        active: false,
        visible: true
    };

    private _showAllDataEntry = {
        id: 'show-all',
        title: 'Show All',
        icon: 'collection-text',
        route: 'data-entry/show-all',
        active: false,
        visible: true
    };

    constructor(userService: UserService) {
        super(userService);
    }

    initialize(model: any) {
        this.onInit(model);
    }

    get countDashboardsNotVisibles() {
        return this._countDashboardsNotVisibles;
    }

    set countDashboardsNotVisibles(value: number) {
        this._countDashboardsNotVisibles = value;
    }

    set countDataEntriesNotVisibles(value: number) {
        this._countDataEntriesNotVisibles = value;
    }

    get countDataEntriesNotVisibles() {
        return this._countDataEntriesNotVisibles;
    }

    get list_item() {
        return this._list_Item;
    }

    set list_item(value: any) {
        this._list_Item = value;
    }

    get listDashboard() {
        return  this._listDashboard;
    }

    set listDashboard( value) {
         this._listDashboard = value;
    }

    get customListDataEntry() {
        return this._customListDataEntry;
    }

    set customListDataEntry(value) {
        this._customListDataEntry = value;
    }

    get showAllDataEntry() {
        return this._showAllDataEntry;
    }

    set showAllDataEntry(value) {
        this._showAllDataEntry = value;
    }

}
