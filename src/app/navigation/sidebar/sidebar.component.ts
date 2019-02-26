import { AfterViewInit, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { MenuItem } from '../../ng-material-components';
import { IMenuItem, IUserInfo } from '../../shared/models';
import { StoreHelper, Store } from '../../shared/services';
import { CommonService } from '../../shared/services/common.service';
import { SidebarService } from './sidebar.service';
import { BrowserService } from 'src/app/shared/services/browser.service';
import { Router } from '@angular/router';

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
    id: 'data-entry',
    title: 'Atlas Sheets',
    icon: 'keyboard',
    route: 'data-entry'
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
    styleUrls: ['./sidebar.component.scss']
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
        private _browser: BrowserService,
        private _router: Router,
        private _store: Store) {
            this._subscription.push(
                this._store.changes$.subscribe(
                (state) => this.changeLogo(state)
            ));
        }

    ngOnInit() {
        this._sidebarService.items$.subscribe(items => this.items = items);
    }

    ngAfterViewInit() { }

    ngOnDestroy() {
        CommonService.unsubscribe(this._sidebarService.subscription);
        if (this._itemsSub && (typeof this._itemsSub.unsubscribe === 'function')) {
            this._itemsSub.unsubscribe();
        }

        this._subscription.forEach(s => s.unsubscribe());

        this._sidebarService.resetMenuItems();
        this._sidebarService.resetUserCanAdd();
        this._sidebarService.resetItemsNotVisible();
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

    onClickLogo(){
        if(this._browser.isMobile()){
            this._router.navigate(['mobile-menu']);
        }
        else{
            this._router.navigate(['dashboards'])
        }

        this._storeHelper.update('sideBarOpen', false);
    }
}
