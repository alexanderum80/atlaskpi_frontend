// Angular Imports
import { Injectable } from '@angular/core';

import { MenuItem } from '../../ng-material-components';
import { Field, ViewModel } from '../../ng-material-components/viewModels';
import { IUserInfo } from '../../shared/models/user';
import { UserService } from '../../shared/services/user.service';
import { IListItem } from '../../shared/ui/lists/list-item';
import { ITargetNew } from '../shared/models/targets.model';
import * as moment from 'moment';


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
        children: []
        }];

    private item: IListItem;
    private predefined: any;

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
            imagePath: this.getImagent(d),
            title: d.name,
            subtitle: 'Next due date:' + this._nextDueDate(d.reportOptions.frequency, d.period) ,
            selected: false,
            extras: d.active,
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

    set predefineds(predefined) {
        this.predefined = predefined;
    }

    selectTarget(item: IListItem, active) {
        this._targetsItemList.forEach(t => {
            t.selected = false;
        });
        if (item) {
            item.selected = true;
            this.item = item;
        }
    }

    changedTitle(title?) {
            if (!title || title === undefined) {
                return;
            }
            const item = this._targetsItemList.filter ( f => f.selected === true );
            this.item = item[0];
            if (this.item !== undefined) {
                this.item.title = title;
            }
    }

    unSelectTarget(frequency, period) {
        this._targetsItemList.forEach (t => {
            t.selected = false;
        });

        this._targetsItemList.push({
            id: '',
            title: 'Target name',
            subtitle: 'Next due date:' + this._nextDueDate(frequency, period) ,
            selected: true,
            imagePath: this.getImagent('true'),
            extras: 'true',
        });

    }
 

    get itemSelected(): IListItem {
        return this.item;
    }

    private getImagent(item) {
        let active = item === 'true' ? item : item['active'];
        let path = './assets/img/targets/target_g_t.png';
        if (active === 'true' || active === true) {
            path = './assets/img/targets/target_t.png';
        }

        this.getChangeIconEnabled(item);

        return path;
    }

    getChangeIconEnabled(item): MenuItem[] {
        let icon = 'notifications-off';
        let title = 'disable';
        if (item.active === 'true' || item.active === true) {
            icon = 'notifications';
            title = 'enabled';
        } else {
            title = 'disable';
            icon = 'notifications-off';
        }

        this.menuItems[0].children.splice(0, 2);

        this.menuItems[0].children.push({
                    id: 'edit',
                    title: title,
                    icon: icon
                });

        this.menuItems[0].children.push({
            id: 'delete',
            title: 'Delete',
            icon: 'delete'
            });

        return this.menuItems;
    }

    private _nextDueDate(frequency, period) {
        let dueDate: any;
        if (frequency === '') {
            frequency = period.replace(/this /g, '') + 'ly';
        }
        switch (frequency) {
            case 'monthly':
                    let dateD = moment().month(moment().month());
                    if (period !== 'this month') {
                      dateD = moment().month(period);
                    }
                    dueDate = dateD.endOf('month').toDate();
                break;
            case 'yearly':
                    dueDate = moment().endOf('year').toDate() ;
                break;
            case 'quarterly':
                    let moments = moment().quarter(moment().quarter());
                    if (period !== 'this quarter') {
                      moments = moment().quarter(period.replace(/Q/g, ''));
                    }
                    dueDate =  moments.endOf('quarter').toDate();
                break;
            case 'weekly':
                    let dateWeek = moment().week(moment().week());
                    if (period !== 'this week') {
                      dateWeek = moment().week(period.replace(/W/g, ''));
                    }
                    dueDate = dateWeek.endOf('week').toDate();
                    break;
        }

        return moment(String(dueDate)).format('MM/DD/YYYY') ;
    }
}
