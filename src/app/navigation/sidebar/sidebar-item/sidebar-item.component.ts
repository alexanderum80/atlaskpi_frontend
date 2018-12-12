import { NavigationEnd, Router } from '@angular/router';
import {
    IMenuItem
} from '../../../shared/models';
import {
    OnDestroy
} from '@angular/core';
import { ISidebarItemSearchResult, SidebarService } from '../sidebar.service';
import { Component, Input, NgZone, OnInit } from '@angular/core';
import { MenuItem } from '../../../ng-material-components';
import {
    Subscription
} from 'rxjs/Subscription';
import { SideBarViewModel } from '../sidebar.viewmodel';
import { isEmpty } from 'lodash';

@Component({
    selector: 'kpi-sidebar-item',
    templateUrl: './sidebar-item.component.pug',
    styleUrls: ['./sidebar-item.component.scss']
})
export class SidebarItemComponent implements OnInit, OnDestroy {
    @Input() menuItem: MenuItem;
    @Input() parent: MenuItem;
    @Input() childrenVisible = true;

    private _selectedSsub: Subscription;
    private _routeEventsSub: Subscription;
    private _createDashSub: Subscription;
    private _lastItem: false;
    isCollapsedNotVisible = true;
    canAddDashboard: boolean;


    constructor(
        private sidebarService: SidebarService,
        private _router: Router,
        private _ngZone: NgZone,
        private vm: SideBarViewModel) {

        }

    ngOnInit() {
        const that = this;

        if (!this.menuItem) {
            this.menuItem = {};
            return;
        }

       this._createDashSub= this.sidebarService._userCanAddDash$.subscribe( value => 
           {  
            this.canAddDashboard = value;
           });

        this._syncSidebarOnRouteChanges();
        this.menuItem.parent = this.parent;

        this._selectedSsub = this.sidebarService.selected$.subscribe((selection: ISidebarItemSearchResult) => {
            that._updateActiveStatus(selection);
        });
        if (this.menuItem.active) {
            this.sidebarService.updateSelection(this.menuItem);
        }
        this.sidebarService.itemsNotVisibles$.subscribe(items => {
            this.vm.countnotvisibles = items;
        });
    }

    ngOnDestroy() {
        this._selectedSsub.unsubscribe();
        this._routeEventsSub.unsubscribe();
        this._createDashSub.unsubscribe();
    }

    selectItem(e) {
        if (!this.menuItem.active) {
            e.preventDefault();
            this.sidebarService.updateSelection(this.menuItem);
        }
    }

    editItem(item: IMenuItem) {
        const newUrl = item.route.replace('dashboards/', 'dashboards/edit/');
        this._router.navigateByUrl(newUrl);
    }
    isVisible(menuItem: any): boolean {
        return !menuItem.parent
        || menuItem.parent.title.toLowerCase() !== 'dashboards'
        || (menuItem.parent.title.toLowerCase() === 'dashboards' && 
        menuItem.visible === this.childrenVisible);
    }

    isDashboardChildren(menuItem: any): boolean {
        return menuItem.parent && menuItem.parent.title &&
            menuItem.parent.title.toLowerCase() === 'dashboards'
            && menuItem.id !== 'list-dashboard';
    }

    private _updateActiveStatus(selection: ISidebarItemSearchResult) {
        const item = this.menuItem;
        
        if (selection.parent && item.children) {
            this.menuItem.active = item.id === selection.parent.id;
          }
         else if (selection.item && !item.children) {
            this.menuItem.active = item.id === selection.item.id;
        }
    }

    private _syncSidebarOnRouteChanges() {
        const that = this;

        this._routeEventsSub = this._router.events.subscribe(r => {

            if (r instanceof NavigationEnd) {
                const route = r.url;

                if (that.menuItem.children) {
                    that._manageActivationForParent(route);
                } else {
                    that._manageActivationForItem(route);
                }
            }
        });
    }

    private _manageActivationForParent(route: string) {
        const item = this.menuItem.children.filter(i => i !== undefined && i !== null).find(i => i.route === route);
        this.menuItem.active = item !== undefined;
    }

    private _manageActivationForItem(route: string) {
        this.menuItem.active = this.menuItem.route === route;
    }
}
