import { ViewModel } from '../../ng-material-components/viewModels/view-model';
import { UserService } from '../../shared/services/user.service';
import { Injectable } from '@angular/core';
import { MenuItem } from 'src/app/ng-material-components';

@Injectable()
export class SideBarViewModel extends ViewModel<any> {

    private _countNotVisibles = 0;
    private _list_Item: any = {};
    private _listDashboard = 
    {
        id: 'list-dashboard',
        title: 'List Dashboard',
        icon: 'collection-text',
        route: `/dashboards/list`,
        visible: true
    } ;
    constructor(userService: UserService) {
        super(userService);
    }

    initialize(model: any) {
        this.onInit(model);
    }

    get countnotvisibles() {
        return this._countNotVisibles;
    }
    set countnotvisibles(value: number) {
        this._countNotVisibles = value;
    }

    get list_item() {
        return this._list_Item;
    }

    set list_item(value: any) {
        this._list_Item = value;
    }

    get listDashboard(){
        return  this._listDashboard;         
    }
   
    set listDashboard( value){
         this._listDashboard = value;         
    }
}
