import { title } from 'change-case';
import { UserService } from './../../shared/services/user.service';
import { ViewAlertActivity } from './../../shared/authorization/activities/alerts/view-alert.activity';
import { AfterViewInit, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { MenuItem } from '../../ng-material-components';
import { IMenuItem, IUserInfo } from '../../shared/models';
import { StoreHelper, Store } from '../../shared/services';
import { CommonService } from '../../shared/services/common.service';
import { SidebarService } from './sidebar.service';
import { AlertsFormService } from '../../alerts/alerts.service';
import { id } from '@swimlane/ngx-datatable/release/utils';

const menuItems: MenuItem[] = [{
    id: 'dashboard',
    title: 'Dashboard',
    icon: 'widgets',
    active: true
}, {
    id: 'charts',
    title: 'Charts',
    icon: 'chart',
    route: 'charts'
}, {
    id: 'charts-slideshow',
    title: 'Chart Slideshow',
    icon: 'collection-image-o',
    route: 'charts-slideshow'
}, {
    id: 'kpis',
    title: 'KPIs',
    icon: 'collection-item',
    route: 'kpis'
}, {
    id: 'data-sources',
    title: 'Data Sources',
    icon: 'grid',
    route: 'datasource'
}, {
    id: 'company',
    title: 'Company',
    icon: 'home',
    route: 'company',
    children: [
        { id: 'location', title: 'Location', icon: '', route: 'company/location'}
    ]
}, {
    id: 'settings',
    title: 'Settings',
    icon: 'settings',
    route: 'settings',
    children: [{
            id: 'roles',
            title: 'Roles',
            icon: 'male-female',
            route: 'settings/roles'
        },
        {
            id: 'users',
            title: 'Users',
            icon: 'accounts',
            route: 'settings/users'
        }
    ]
}];


@Component({
    selector: 'kpi-sidebar',
    templateUrl: './sidebar.component.pug',
    styleUrls: ['./sidebar.component.scss'],
    providers: [AlertsFormService, ViewAlertActivity]
})
export class SidebarComponent implements OnInit, AfterViewInit, OnDestroy {
    @Input() width = 220;
    items: IMenuItem[];
    logoPath: string;

    private _itemsSub: Subscription;
    private _subscription: Subscription[] = [];

    constructor(
        private _storeHelper: StoreHelper,
        private _sidebarService: SidebarService,
        public _alertService: AlertsFormService,
        private _userService: UserService,
        private _viewAlertActivity: ViewAlertActivity,
        private _store: Store) {
            this._subscription.push(
                this._store.changes$.subscribe(
                (state) => this.changeLogo(state)
            ));
        }

    ngOnInit() {
        this._sidebarService.items$.subscribe(items => {
            this.items = items;
            if (this.viewAlerts()) {
                const index = this.items.findIndex(i => i.id === 'data-lab');
                if (this.items[index].children.findIndex(c => c.id === 'alerts') === -1) {
                    this.items[index].children.push({
                        id: 'alerts',
                        icon: 'notifications-active',
                        route: '/alerts',
                        title: 'Alerts'
                    });
                }
            }
        });
    }

    ngAfterViewInit() { }

    ngOnDestroy() {
        CommonService.unsubscribe(this._sidebarService.subscription);
        if (this._itemsSub && (typeof this._itemsSub.unsubscribe === 'function')) {
            this._itemsSub.unsubscribe();
        }

        this._subscription.forEach(s => s.unsubscribe());
    }

    viewAlerts() {
        return this._userService.hasPermission('View', 'Alert');
    }

    hideSidebar(e: Event) {
        e.preventDefault();
        this._storeHelper.update('sideBarOpen', false);
    }

    get menuItems() {
        return this.items.length;
    }

    private _getDashboards(user: IUserInfo) {
        if (!user) {
            this.items[0].children = null;
        }
    }

    changeLogo(state) {
        if (state.theme === 'dark') {
            this.logoPath = 'white-logo.png';
        } else {
            this.logoPath = 'logo.png';
        }
    }
}
