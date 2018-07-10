import { Injectable, Injector } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import SweetAlert from 'sweetalert2';
import { StoreHelper } from './store-helper.service';
import { IActivity } from '../authorization/activity';
import { AuthenticationService } from './authentication.service';
import { Store } from './store.service';
import { UserService } from './user.service';

export interface RouteAccess {
    id: number;
    shouldActivate: boolean;
    state: any;
    url: string;
    urlAfterRedirects: any;
}

@Injectable()
export class AuthGuard implements CanActivate {

    hasAccess = true;

    constructor(private _router: Router,
        private _authenticationSvc: AuthenticationService,
        private _userService: UserService,
        private _store: Store,
        private _injector: Injector,
        private _storeHelper: StoreHelper
    ) {}

    canActivate(activatedRoute: ActivatedRouteSnapshot, routerStateSnapshot: RouterStateSnapshot) {
        if (!this._authenticationSvc.authenticated) {
            this._router.navigate(['/start']);
            return false;
        }

        if (!this._userService.user) {
            this._storeHelper.update('previousRoute', (activatedRoute as any)._routerState.url);
            this._router.navigate(['/loading-profile']);
            return false;
        }

        if ((<any>activatedRoute.component).__activity__) {
            // process authorization via activity
            const activity: IActivity = new (<any>activatedRoute.component).__activity__();
            if (!activity.check(this._userService.user)) {
                this._router.navigateByUrl('/unauthorized');
                return false;
            }
        }

        const state = (this._store.getState() as any);

        // if (state.inDemoMode) {
        //     const canAccess = this._demoModePermissions(routerStateSnapshot.url);
        //     if (!canAccess) {
        //         SweetAlert({
        //             title: 'You are currently on Demo Mode',
        //             text: 'Please contact AtlasKPI to activate your account today 800-905-2989 or email us at info@atlaskpi.com',
        //             type: 'info'
        //         });
        //         return false;
        //     }
        // }

        return true;
    }


    private _demoModePermissions(url: string) {
        let canRoute;
        canRoute = true;
        /* switch (url) {
            case '/kpis/list':
            case '/kpis/':
            case '/kpis/add':
            case '/settings/users':
            case '/settings/roles':
            case '/users/audit':
            case '/departments':
            case '/business-units':
            case '/locations':
            case '/employees':
                canRoute = false;
                break;
            default:
                canRoute = true;
        } */
        return canRoute;
    }

}
