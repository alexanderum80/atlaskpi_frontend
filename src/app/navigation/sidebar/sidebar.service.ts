    import { IDataEntrySource } from '../../data-entry/shared/models/data-entry.models';
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
import { IUserInfo, IMenuItem } from '../../shared/models';
import { StoreHelper } from '../../shared/services';
import { UserService } from '../../shared/services/user.service';
import { SideBarViewModel } from './sidebar.viewmodel';
import { sortBy } from 'lodash';
import { environment } from '../../../environments/environment';
import { IDataSource } from '../../shared/domain/kpis/data-source';
import { IFunnel } from '../../funnels/shared/models/funnel.model';

export interface ISidebarItemSearchResult {
    parent?: MenuItem;
    item: MenuItem;
}

// const funnelListMock: IFunnel[] =
// // [];
// [
//     { _id: '1', name: 'Sales Funnel', stages: [] },
//     { _id: '2', name: 'Inquires Funnel', stages: [] },
// ];


const MENU_ITEMS: MenuItem[] = [
{
    id: 'dashboard',
    title: 'Dashboards',
    icon: 'widgets',
},
{
    id: 'appointments',
    title: 'Appointments',
    icon: 'calendar',
    route: '/appointments/list'
}, 
{
    id: 'funnel',
    title: 'Funnels',
    icon: 'triangle-down',
},
{
    id: 'charts-slideshow',
    title: 'Slideshows',
    icon: 'collection-image-o',
    route: '/charts-slideshow'
}, 
{
    id: 'alerts',
    icon: 'notifications-active',
    route: '/alerts',
    title: 'Live Alerts'
},
{
    id: 'data-entry',
    title: 'Atlas Sheets',
    icon: 'keyboard'
},
{
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
} 
// , {
//     id: 'company',
//     title: 'Company',
//     icon: 'home',
//     children: [
//         {
//             id: 'departments',
//             title: 'Departments',
//             route: 'departments'
//         },
//         {
//             id: 'businessUnits',
//             title: 'Business Units',
//             route: 'business-units'
//         },
//         {
//             id: 'locations',
//             title: 'Locations',
//             route: 'locations'
//         },
//         {
//             id: 'employees',
//             title: 'Employees',
//             route: 'employees'
//         }
//     ]
// }
, {
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
},
{
    id: 'support',
    title: 'Remote Support',
    icon: 'headset-mic',
    externalUrl: environment.remoteSupportModuleUrl
}

];


const DashboardsQuery = gql `
query Dashboards($group: String!) {
    dashboards(group: $group) {
        _id
        name
        visible
        order
    }
}
`;

const DataEntriesQuery = gql `
query DataEntries {
  dataEntries {
        _id
        name
        description
    }
}
`;

const ListFunnelSidebar = gql `
query ListFunnelsForSidebar{
  funnels {
    _id
    name
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
    private _dataEntriesQuery: QueryRef<{}>;
    private _dashboardsNotVisibles = 0;
    private _dataEntriesNotVisibles = 0;
    private _dashboardsNotVisiblesSubject = new BehaviorSubject < number > (0);
    private _dataEntriesNotVisiblesSubject = new BehaviorSubject < number > (0);
    private _userCanAddDashSubject = new BehaviorSubject < boolean > (false);

    userCanAddDashboard: boolean;

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
        this._userService.user$.subscribe(u => {
                if (u) {
                    that.checkPemits(u);
                    that._getDashboards(u);
                    that._getManualEntrys(u);
                    that.refreshFunnels();
                }
            });

        this._subscription.push(this._userCanAddDash$.subscribe( permit =>
            this.userCanAddDashboard = permit
        ));

        this._router.events.subscribe(e => {
            if (e instanceof NavigationEnd) {
                that._currentRoute = that._router.url;
            }
        });
    }

    get items$(): Observable< MenuItem[] > {
        return this._itemsSubject.asObservable();
    }

    get dashboardsNotVisibles$(): Observable <number> {
        return this._dashboardsNotVisiblesSubject.asObservable();
    }

    get dataEntriesNotVisibles$(): Observable <number> {
        return this._dataEntriesNotVisiblesSubject.asObservable();
    }

    get selected$(): Observable < MenuItem > {
        return this._selectedSubject.asObservable();
    }

    get subscription(): Subscription[] {
        return this._subscription;
    }

    get _userCanAddDash$(): Observable<boolean> {
        return this._userCanAddDashSubject.asObservable();
    }

    refreshDashboards() {
        this._getDashboards(this._userService.user);
    }

    refreshFunnels(funnels?: IFunnel[]) {
        if (!funnels || !funnels.length) {
            this._apollo.query<{ funnels: IFunnel[] }>({
                query: ListFunnelSidebar,
                fetchPolicy: 'network-only'
            })
            .toPromise()
            .then(res => {
                const result = sortBy(res.data.funnels, ['_id']);
                this._processFunnelSubMenu(result);
            })
            .catch(err => console.log('error fetching funnels ' + err));
            return;
        }

        const list = sortBy(funnels, ['_id']);
        this._processFunnelSubMenu(list);
    }

    updateSelection(menuItem: MenuItem) {
        if (!menuItem) {
            return;
        }

        if (menuItem.id === 'reload') {
            window.location.reload();
        }

        if (menuItem.externalUrl) {
            window.open(menuItem.externalUrl);
            return;
        }

        // if there is an item selected with children I should be able to deselect it
        if (menuItem.children) {
            this._selectedSubject.next({ parent: menuItem, item: null });
        } else {
            this._storeHelper.update('sideBarOpen', false);
            this._selectedSubject.next({ parent: menuItem.parent, item: menuItem });
        }

        if (menuItem.route) {
            this._router.navigate([menuItem.route]);
        } else if (menuItem.url) {
            this._router.navigateByUrl(menuItem.url);
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
                const dashboardsSorted = sortBy(data.dashboards, ['order', '_id']);
                that._processDashboardsSubmenu(dashboardsSorted);
            }));
        } else {
            this._dashboardQuery.refetch({ group: 'all' }).then((res: any) => {
                const dashboardsSorted = sortBy(res.data.dashboards, ['order', '_id']);
                that._processDashboardsSubmenu(dashboardsSorted);
            });
        }
    }

    private _processDashboardsSubmenu(dashboards: IDashboard[]) {
        const that = this;
        const items = this._itemsSubject.value;
        const userCanAddDashboards = this._userCanAddDashSubject.value;

        let isDashboardRoute = false;
        let isVisible = true;
        let listdashboardIdNoVisible;
        if (this._userService.user && this._userService.user.preferences
            && this._userService.user.preferences.dashboardIdNoVisible !== null) {
            listdashboardIdNoVisible = this._userService.user.preferences.dashboardIdNoVisible.split('|');
        }

        if (!dashboards || !dashboards.length) {
            if (userCanAddDashboards) {
                items[0].active = true;
                this.vm.listDashboard.active = true;
                this._router.navigate([this.vm.listDashboard.route]);
            }
            return;
        }

        this.vm.listDashboard.active = false;
        this._dashboardsNotVisibles = 0;
        items[0].children = dashboards.map(d => {
            // check if the current root is relarted to the dashboards
            const route = `/dashboards/${d._id}`;
            const active = route === that._currentRoute;
            if (active) {
                isDashboardRoute = true;
            }
            if (!listdashboardIdNoVisible) {
                isVisible = true;
            } else {
                isVisible = listdashboardIdNoVisible.find(l => l === d._id) ? false : true;
            }
            if (isVisible === false) {
                this._dashboardsNotVisibles += 1;
            }
            return {
                id: d.name,
                title: d.name,
                route: route,
                group: 'dashboard',
                active: active,
                visible: isVisible
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
        this._dashboardsNotVisiblesSubject.next(this._dashboardsNotVisibles);
    }

    private _getManualEntrys(user: IUserInfo) {
        const that = this;
        if (!this._dataEntriesQuery) {
            this._dataEntriesQuery = this._apollo.watchQuery({
                query: DataEntriesQuery,
            });
            this.subscription.push(this._dataEntriesQuery.valueChanges.subscribe(({ data }: any) => {
                const dataEntriesSorted = sortBy(data.dataEntries, ['_id']);
                that._processDataEntriesSubmenu(dataEntriesSorted);
            }));
        } else {
            this._dataEntriesQuery.refetch({ }).then((res: any) => {
                const dataEntriesSorted = sortBy(res.data.dataEntries, ['_id']);
                that._processDataEntriesSubmenu(dataEntriesSorted);
            });
        }
    }

    findItemIndexById(id: string) {
        const items = this._itemsSubject.value;
        for (let [index, value] of Object.entries(items)) {
            if (value.id === id) {
                return +index;
            }
        }
    }

    private _processDataEntriesSubmenu(dataEntries: IDataEntrySource[]) {
        const items = this._itemsSubject.value;
        const index = this.findItemIndexById('data-entry');

        items[index].children = [];
        let isVisible = true;
        let atlasSheetsIdNoVisible;
        if (this._userService.user && this._userService.user.preferences
            && this._userService.user.preferences.atlasSheetsIdNoVisible !== null) {
                atlasSheetsIdNoVisible = this._userService.user.preferences.atlasSheetsIdNoVisible.split('|');
        }

        this._dataEntriesNotVisibles = 0;

        if (dataEntries || dataEntries.length) {
            items[index].children = dataEntries.map(d => {
                // check if the current root is relarted to the data entry
                const lastIndexExtension = d.description.lastIndexOf('.');
                const route = `/data-entry/enter-data/${d._id}`;
                if (!atlasSheetsIdNoVisible) {
                    isVisible = true;
                } else {
                    isVisible = atlasSheetsIdNoVisible.find(l => l === d._id) ? false : true;
                }
                if (isVisible === false) {
                    this._dataEntriesNotVisibles += 1;
                }
                    return {
                    id: d.name,
                    title: d.description.substr(0, lastIndexExtension !== -1 ? lastIndexExtension : d.description.length),
                    route: route,
                    group: 'data-entry',
                    visible: isVisible
                };
            });
        }

        this._dataEntriesNotVisiblesSubject.next(this._dataEntriesNotVisibles);
    }

    private _processFunnelSubMenu(funnels: IFunnel[]) {
        const menuItems = this._itemsSubject.value;
        const canAddFunnels = true;

        const isInFunnelRoute = this._currentRoute && this._currentRoute.indexOf('/funnels/') !== -1;

        const funnelMenuItem = menuItems.find(i => i.id === 'funnel');
        const listFunnelMenuItem = this._getListFunnelMenuItem();

        funnelMenuItem.children = [];

        if (!funnels || !funnels.length) {

            if (canAddFunnels) {
                funnelMenuItem.children = [ listFunnelMenuItem ];
                this._itemsSubject.next(menuItems);
            }

            return;
        }

        // this.vm.listFunnel.active = false;

        funnelMenuItem.children = funnels.map(x => {
            // check if the current root is relarted to the dashboards
            const route = `/funnels/${x._id}`;
            const active = route === this._currentRoute;

            return {
                route,
                active,
                id: x.name,
                title: x.name,
                group: 'funnel',
                isVisible: true
            };
        });

        // mark the dashboards parent as selected if a dashboard was selected
        if (isInFunnelRoute) {
            funnelMenuItem.active = true;
        }

        if (canAddFunnels) {
            funnelMenuItem.children.push(listFunnelMenuItem);
        }

        this._itemsSubject.next(menuItems);
    }

    private _getListFunnelMenuItem(options?: IMenuItem): IMenuItem {
        const { visible = true } = options || {};
        return {
            visible,
            id: 'list-funnel',
            title: 'Manage Funnels',
            icon: 'collection-text',
            route: `/funnels/list`,
        };
    }

    resetMenuItems() {

        MENU_ITEMS[0] = {
            id: 'dashboard',
            title: 'Dashboards',
            icon: 'widgets',
        };
        this._itemsSubject.next(MENU_ITEMS);
    }

    resetUserCanAdd() {
        this._userCanAddDashSubject.next(false);
    }

    resetItemsNotVisible() {
        this._dashboardsNotVisiblesSubject.next(0);
    }


    checkPemits(user): void {
        this._userCanAddDashSubject.next(this.addDashboardActivity.check(user));
    }

}
