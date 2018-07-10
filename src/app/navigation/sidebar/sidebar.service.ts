import { observable } from 'rxjs/symbol/observable';
import { Injectable } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Apollo, QueryRef } from 'apollo-angular';
import gql from 'graphql-tag';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';

import { IDashboard } from '../../dashboards/shared/models';
import { MenuItem } from '../../ng-material-components';
import { AddDashboardActivity } from '../../shared/authorization/activities/dashboards/add-dashboard.activity';
import { IUserInfo } from '../../shared/models';
import { StoreHelper } from '../../shared/services';
import { UserService } from '../../shared/services/user.service';
import { SideBarViewModel } from './sidebar.viewmodel';

export interface ISidebarItemSearchResult {
    parent?: MenuItem;
    item: MenuItem;
}

const MENU_ITEMS: MenuItem[] = [{
    id: 'dashboard',
    title: 'Dashboards',
    icon: 'widgets'
},
{
    id: 'appointments',
    title: 'Appointments',
    icon: 'calendar',
    route: '/appointments/list'
}, {
    id: 'charts-slideshow',
    title: 'Chart Slideshow',
    icon: 'collection-image-o',
    route: '/charts-slideshow'
}, {
    id: 'data-lab',
    title: 'Data Lab',
    icon: 'layers',
    children: [
        {
            id: 'charts',
            title: 'Charts',
            icon: 'chart',
            route: '/charts'
        },
        {
            id: 'widgets',
            title: 'Widgets',
            icon: 'widgets',
            route: '/widgets'
        },
        {
            id: 'kpis',
            title: 'KPIs',
            icon: 'collection-item',
            route: '/kpis/list'
        }, {
            id: 'data-sources',
            title: 'Data Sources',
            icon: 'grid',
            route: '/datasource'
        }
    ]
}, {
    id: 'company',
    title: 'Company',
    icon: 'home',
    children: [
        {
            id: 'departments',
            title: 'Departments',
            route: 'departments'
        },
        {
            id: 'businessUnits',
            title: 'Business Units',
            route: 'business-units'
        },
        {
            id: 'locations',
            title: 'Locations',
            route: 'locations'
        },
        {
            id: 'employees',
            title: 'Employees',
            route: 'employees'
        }
    ]
}, {
    id: 'settings',
    title: 'Settings',
    icon: 'settings',
    children: [{
            id: 'roles',
            title: 'Roles',
            icon: 'male-female',
            route: '/settings/roles'
        },
        {
            id: 'users',
            title: 'Users',
            icon: 'accounts',
            route: '/settings/users'
        },
        {
            id: 'audit',
            title: 'Audit',
            icon: 'search-in-file',
            route: '/users/audit'
        },
        {
            id: 'reload',
            title: 'Reload',
            icon: 'refresh'
        }
    ]
}];


const DashboardsQuery = gql `
query Dashboards($group: String!) {
    dashboards(group: $group) {
        _id
        name
        visible
    }
}
`;

@Injectable()
export class SidebarService {
    private _itemsSubject = new BehaviorSubject < MenuItem[] > (MENU_ITEMS);
    private _selectedSubject = new Subject < ISidebarItemSearchResult > ();
    private _currentRoute: string;
    private _subscription: Subscription[] = [];
    private _dashboardQuery: QueryRef<{}>;
    private _itemsNotVisibles = 0;
    private _itemsNotVisiblesSubject = new BehaviorSubject < number > (0);

    constructor(
        private _router: Router,
        private _apollo: Apollo,
        private _userService: UserService,
        private _activeRoute: ActivatedRoute,
        private _storeHelper: StoreHelper,
        public vm: SideBarViewModel,
        public addDashboardActivity: AddDashboardActivity
    ) {
        this.vm.addActivities([this.addDashboardActivity]);

        const that = this;
        this._userService.user$.subscribe(u => that._getDashboards(u));
        this._router.events.subscribe(e => {
            if (e instanceof NavigationEnd) {
                that._currentRoute = that._router.url;
            }
        });
    }

    get items$(): Observable< MenuItem[] > {
        return this._itemsSubject.asObservable();
    }

    get itemsNotVisibles$(): Observable <number> {
        return this._itemsNotVisiblesSubject.asObservable();
    }

    get selected$(): Observable < MenuItem > {
        return this._selectedSubject.asObservable();
    }

    get subscription(): Subscription[] {
        return this._subscription;
    }

    refreshDashboards() {
        this._getDashboards(this._userService.user);
    }

    updateSelection(menuItem: MenuItem) {
        if (!menuItem) {
            return;
        }

        if (menuItem.id === 'reload') {
            window.location.reload();
        }

        // if there is an item selected with children I should be able to deselect it
        if (menuItem.children) {
            this._selectedSubject.next({ parent: menuItem, item: null });
        } else {
            this._storeHelper.update('sideBarOpen', false);
            this._selectedSubject.next({ parent: menuItem.parent, item: menuItem });
        }

        // if the item has route then go there
        if (menuItem.route) {
            this._router.navigate([menuItem.route]);
        }
    }

    private _getDashboards(user: IUserInfo) {
        const that = this;
        if (!this._dashboardQuery) {
            this._dashboardQuery = this._apollo.watchQuery({
                query: DashboardsQuery,
                variables: {
                    group: 'all'
                }
            });
            this.subscription.push(this._dashboardQuery.valueChanges.subscribe(({ data }: any) => {
                that._processDashboardsSubmenu(data.dashboards);
            }));
        } else {
            this._dashboardQuery.refetch({ group: 'all' }).then((res: any) => {
                that._processDashboardsSubmenu(res.data.dashboards);
            });
        }
    }

    private _processDashboardsSubmenu(dashboards: IDashboard[]) {
        const that = this;
        const items = this._itemsSubject.value;
        let isDashboardRoute = false;
        if (!dashboards) {
            return;
        }
        this._itemsNotVisibles = 0;
        items[0].children = dashboards.map(d => {
            // check if the current root is relarted to the dashboards
            const route = `/dashboards/${d._id}`;
            const active = route === that._currentRoute;
            if (active) {
                isDashboardRoute = true;
            }
            if (d.visible === false) {
                this._itemsNotVisibles += 1;
            }
            return {
                id: d.name,
                title: d.name,
                route: route,
                group: 'dashboard',
                active: active,
                visible: (d.visible === null || d.visible === true) ? true : false
            };
        });
        // mark the dashboards parent as selected if a dashboard was selected
        if (isDashboardRoute) {
            items[0].active = true;
        }

        const firstDashboardExist = items != null
                                && items[0].children != null
                                && items[0].children.length > 0
                                && items[0].children[0].route;

        if (firstDashboardExist && (this._router.url === '/' || this._router.url === '/dashboards')) {
            const firstDashboard = `/dashboards/${items[0].children[0].route.split('/')[2]}`;
            this._router.navigate([firstDashboard]);
        }
        this._itemsSubject.next(items);
        this._itemsNotVisiblesSubject.next(this._itemsNotVisibles);
    }

}
