// Angular Imports
import { Injectable } from '@angular/core';

import { MenuItem, SelectionItem } from '../../ng-material-components';
import { Field, ViewModel } from '../../ng-material-components/viewModels';
import { IUserInfo } from '../../shared/models/user';
import { UserService } from '../../shared/services/user.service';
import { IListItem } from '../../shared/ui/lists/list-item';
import { ITargetNew } from '../shared/models/targets.model';
import * as moment from 'moment';


import { map } from 'lodash';
import { element } from 'protractor';

// App Code

interface IFilter {
    search: string;
}

@Injectable()
export class ListTargetsViewModel extends ViewModel<IFilter> {
    private _targets: ITargetNew[] = [];
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
    
    private item: IListItem;
    
    constructor(userService: UserService) {
        super(userService);
    }

    get targets(): ITargetNew[] {
        return this._targets;
    }

    set targets(list: ITargetNew[]) {
        if (list === this._targets) {
            return;
        }

        this._targets = list;
        
        this._targetsItemList =  this._targets.map(d => ( {
            id: d._id ,
            imagePath: './assets/img/targets/target_g_t.png',
            title: d.name,
            subtitle: 'Next due date:' + this._nextDueDate(d.reportOptions.frequency) ,
            selected: false,
        }));
        if (this._targetsItemList.length > 0 ) {
            this._targetsItemList[0].selected = true;
            this.item = this._targetsItemList[0];
            this.item.imagePath = './assets/img/targets/target_t.png';
        }

    }

    @Field({ type: String })
    search: string;

    initialize(model: IFilter): void {
        this.onInit(model);
    }

    get targetItems(): IListItem[] {
        return this._targetsItemList;
    }


    selectTarget(item: IListItem) {
        this._targetsItemList.forEach(t =>{ 
            t.selected = false;
            t.imagePath = './assets/img/targets/target_g_t.png';
        });
        if (item) {
            item.selected = true;
            item.imagePath = './assets/img/targets/target_t.png';
            this.item = item;
        }
    }

    unSelectTarget() {
        this._targetsItemList.forEach(t =>{
            t.selected = false;
            t.imagePath = './assets/img/targets/target_g_t.png';
        });
    }


    get itemSelected(): IListItem {
        return this.item;
    }


    private _nextDueDate(frequency) {
        //Aqui hay que general el valor
        let dueDate: any;

        switch(frequency) {
            case 'monthly':
                    dueDate = moment().endOf('month').toDate();
                break;
            case 'yearly':
                    dueDate = moment().endOf('year').toDate() ;
                break;
            case 'quartely':
                    dueDate =  moment().endOf('quarter').toDate();
                break;
        }

        return moment(String(dueDate)).format('MM/DD/YYYY') ;
    }

}
