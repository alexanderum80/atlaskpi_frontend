import { UserService } from '../../shared/services/user.service';
import { Field, ViewModel } from '../../ng-material-components/viewModels';
import { IDashboard } from '../shared/models';
import { Injectable } from '@angular/core';
import { IListItem } from '../../shared/ui/lists/list-item';
import {MenuItem} from '../../ng-material-components';
import { isNumber } from 'lodash';
import { visibleMenuItem, notVisibleMenuItem } from '../../shared/helpers/visible-action-item.helper';
import { IUserInfo } from '../../shared/models';

interface IFilter {
    search: string;
}

@Injectable()
export class ListDashboardViewModel extends ViewModel<IFilter> {
    private _listDashboardIdNoVisible;
    private _dashboards: IDashboard[];
    private _dashboardItemList: IListItem[];
    private _actionItems: MenuItem[];
    private _userService: UserService;

    constructor(userService: UserService) {
        super(userService);

        this.setActionItems();
    }

    get alistDashboardIdNoVisible() {
        return this._listDashboardIdNoVisible;
    }

    get dashboards(): IDashboard[] {
        return this._dashboards;
    }

    get dashboardItems(): IListItem[] {
        return this._dashboardItemList;
    }

    get dashboardActionItems(): MenuItem[] {
        return this._actionItems;
    }

    set alistDashboardIdNoVisible(upatedUserInfo: IUserInfo) {
        if (!upatedUserInfo) {
            return;
        }
        this._listDashboardIdNoVisible
            = upatedUserInfo.preferences.dashboardIdNoVisible === null
            ? undefined
            : upatedUserInfo.preferences.dashboardIdNoVisible.split('|');
    }

    set dashboards(list: IDashboard[]) {
        if (list === this._dashboards) {
            return;
        }
        this._dashboards = list;
        let isVisible: boolean;
        this._dashboardItemList = this._dashboards.map(d => {
            if (!this._listDashboardIdNoVisible) {
                isVisible = true;
            } else {
                    isVisible
                        = this._listDashboardIdNoVisible.find(l => l === d._id)
                        ? false
                        : true;
            }
            return {
                id: d._id,
                imagePath: '/assets/img/dashboard/dashboard.png',
                title: d.name,
                subtitle: d.description,
                extras: {
                   // access: d.accessLevels
                },
                visible: isVisible
            };
        });
    }


    @Field({ type: String })
    search: string;

    initialize(model: IFilter): void {
        this.onInit(model);
    }

    setActionItems(): void {
        this._actionItems = [{
            id: 'more-options',
            icon: 'more-vert',
            children: [{
                    id: 'edit',
                    title: 'Edit',
                    icon: 'edit'
                },
                {
                    id: 'delete',
                    title: 'Delete',
                    icon: 'delete'
                },
                {
                    id: 'visible',
                    title: 'Visible',
                    icon: 'eye-off'
                }
            ]
        }];
    }

    updateActionItem(item: IListItem): void {
        if (!item) {
            return;
        }

        if (!Array.isArray(this._actionItems) || !this._actionItems.length) {
            return;
        }

        const children: MenuItem[] = this._actionItems[0].children;
        const index = children.findIndex(child => child.id === 'visible');
        if (isNumber(index)) {
            children[index] = item.visible ? notVisibleMenuItem() : visibleMenuItem();
        }
        this._actionItems[0].children = children;
    }
}
