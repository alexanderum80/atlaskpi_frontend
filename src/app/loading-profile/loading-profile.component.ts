import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Store } from '../shared/services/store.service';
import { UserService } from '../shared/services/user.service';
import { Subscription } from 'rxjs/Subscription';

@Component({
    selector: 'kpi-loading-profile',
    templateUrl: './loading-profile.component.pug',
    styleUrls: ['./loading-profile.component.scss']
})
export class LoadingProfileComponent implements OnInit, OnDestroy {
    loading: boolean;

    private _userSubscription: Subscription;

    constructor(
        private _userService: UserService,
        private _router: Router,
        private _store: Store
    ) {
        this.loading = true;
    }

    ngOnInit() {
        const that = this;
        const state = this._store.getState();

        // if we already have a user then get out of here
        if (this._userService.user) {
            return this._processRouteChange(this._userService.user);
        }

        this._userSubscription = this._userService.user$.subscribe(user => {
            that._processRouteChange(user);
        });
    }

    ngOnDestroy() {
        if (this._userSubscription) {
            this._userSubscription.unsubscribe();
        }
    }


    private _processRouteChange(user) {
        const state = this._store.getState();

        if (user && this.loading) {
            const route = state.previousRoute || '/';
            this._router.navigateByUrl(route);
            this.loading = false;
        }
    }

}
