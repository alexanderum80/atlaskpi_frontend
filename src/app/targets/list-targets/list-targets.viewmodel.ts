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
            imagePath: d.active ? './assets/img/targets/target_t.png' : './assets/img/targets/target_g_t.png',
            title: d.name,
            subtitle: 'Next due date:' + this._nextDueDate(d.reportOptions.frequency) ,
            selected: false,
        }));
        if (this._targetsItemList.length > 0 ) {
            this._targetsItemList[0].selected = true;
            this.item = this._targetsItemList[0];
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


    selectTarget(item: IListItem, active) {
        this._targetsItemList.forEach(t => {
            t.selected = false;
            t.imagePath = active ? './assets/img/targets/target_t.png' : './assets/img/targets/target_g_t.png';
        });
        if (item) {
            item.selected = true;
            item.imagePath = active ? './assets/img/targets/target_t.png' : './assets/img/targets/target_g_t.png';
            this.item = item;
        }
    }

    unSelectTarget(frequency) {
        this._targetsItemList.forEach (t => {
            t.selected = false;
        });

        this._targetsItemList.push({
            id: '',
            title: 'Target name',
            subtitle: 'Next due date:' + this._nextDueDate(frequency) ,
            selected: true,
            imagePath: './assets/img/targets/target_t.png',
        });
    }


    get itemSelected(): IListItem {
        return this.item;
    }


    private _nextDueDate(frequency) {
        let dueDate: any;
        switch (frequency) {
            case 'monthly':
                    let dateD = moment().month(moment().month());
                    dueDate = dateD.endOf('month').toDate();
                break;
            case 'yearly':
                    dueDate = moment().endOf('year').toDate() ;
                break;
            case 'quarterly':
                    let moments = moment().quarter(moment().quarter());
                    dueDate =  moments.endOf('quarter').toDate();
                break;
            case 'weekly':
                    let dateWeek = moment().week(moment().week());
                    dueDate = dateWeek.endOf('week').toDate();
                    break;
        }
        return moment(String(dueDate)).format('MM/DD/YYYY') ;
    }

}
