import { UserAgreementService } from './users/user-agreement/user-agreement.service';
import { IUserAgreement } from './shared/models/user';
import { isString, isEmpty } from 'lodash';

import { CommonService } from './shared/services/common.service';
import {Component, OnDestroy, ViewChild} from '@angular/core';
import {ActivatedRoute, NavigationStart, Router} from '@angular/router';
import threeD from 'highcharts/js/highcharts-3d.src.js';
import boost from 'highcharts/js/modules/boost.src.js';
import exportData from 'highcharts/js/modules/export-data.src.js';
import exporting from 'highcharts/js/modules/exporting.src.js';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import { environment } from '../environments/environment';
import { IUserInfo } from './shared/models';
import {
    AuthenticationService,
    LocalStorageService,
    State,
    Store,
    StoreHelper,
    UserService,
    WindowService,
} from './shared/services';
import { ApolloService } from './shared/services/apollo.service';
import { BrowserService } from './shared/services/browser.service';
import { VersionService } from './shared/services/version.service';
import {IRole} from './roles/shared/role';
import {UserAgreementComponent} from './users/user-agreement/user-agreement.component';
import {ModalComponent} from './ng-material-components';
import SweetAlert, {SweetAlertOptions} from 'sweetalert2';
import { filter } from 'rxjs/operators';
import { HeaderComponent } from '../app/navigation/header/header.component';

const routesWithNoLayout = ['/users/forgot-password'];
const VERSION_CHECK_TIMESPAN = 1800000;


// ******************************************************************
//     HIGHCHARTS
// ******************************************************************

const HighchartsEvents = require('highcharts'),
    HighchartsCustomEvents = require('highcharts-custom-events')(HighchartsEvents);

const Highcharts = require('highcharts/js/highcharts');

threeD(Highcharts);

exporting(Highcharts);

exportData(Highcharts);

boost(Highcharts);


Highcharts.Chart.prototype.callbacks.push(function (chart) {
    const hasTouch = document.documentElement.ontouchstart !== undefined;
    const mouseTracker = chart.pointer;
    const container = chart.container;
    let mouseMove;

    mouseMove = function (e) {
        if (hasTouch) {
            if (e && e.touches && e.touches.length > 1) {
                mouseTracker.onContainerTouchStart(e);
            } else {
                return;
            }
        } else {
            mouseTracker.onContainerMouseMove(e);
        }
    };

    const click = function (e) {
        if (hasTouch) {
            mouseTracker.onContainerMouseMove(e);
        }
        mouseTracker.onContainerClick(e);
    };

    container.onmousemove = container.ontouchstart = container.ontouchmove = mouseMove;
    container.onclick = click;
});

// ******************************************************************
//     HIGHCHARTS
// ******************************************************************

const inDemoMode = require('graphql-tag/loader!./in-demo-mode.query.gql');

@Component({
    selector: 'kpi-root',
    templateUrl: './app.component.pug',
    styleUrls: ['./app.component.scss'],
    providers: [UserAgreementService]
})
export class AppComponent implements OnDestroy {
    userAgreement: UserAgreementComponent;
    header: HeaderComponent;
    showAgreement = false;

    @ViewChild('userAgreement') set content(content: any) {
        if (content) {
            this.userAgreement = content;
        }
    }

    restServer = environment.restServer;

    hideLayout = null;
    sideBarOpen = false;
    currentUser = null;
    mobile: boolean;
    demoMode = false;
    showHelpCenter = false;

    agreementBackdrop = 'static';
    username: string;

    authenticated$: Observable < boolean > ;
    private _subscription: Subscription[] = [];

    constructor(
        private _route: ActivatedRoute,
        private _router: Router,
        private _store: Store,
        private _storeHelper: StoreHelper,
        private _authService: AuthenticationService,
        private _userSvc: UserService,
        private _localStorageService: LocalStorageService,
        private _browser: BrowserService,
        private _windowService: WindowService,
        private _versionService: VersionService,
        private _apolloService: ApolloService,
        private _userAgreeSvc: UserAgreementService
        ) {
        this._subscription.push(
            this._store.changes$.subscribe(state => this._processStoreChanges(state))
        );
        this._userSvc.user$.subscribe(user => this._processUserChanges(user));

        this.mobile = _browser.isMobile();
        this.authenticated$ = this._authService.authenticated$;

        const that = this;
        this._router.events
            .pipe(
                filter(e =>  e instanceof NavigationStart)
            )
            .subscribe((r) => this._processRouteChange( < NavigationStart > r));

        this._startCheckingForNewVersion();
    }

    ngOnDestroy() {
        CommonService.unsubscribe([
            ...this._userSvc.subscription,
            ...this._subscription
        ]);
    }

    signInAgreement(accept: boolean): void {
        this._userAgreeSvc.setOwnerAgreed(accept);
        if (!accept) {
            this._authService.logout();
        }
        this.cancel();
    }

    cancel(): void  {
        const that = this;
        this.showAgreement = false;
        this._store.changes$.subscribe(state => {
            that.showHelpCenter = true;
        });
    }

    private _processUserChanges(user: IUserInfo) {
        // user changes
        this.currentUser = user;

        if (user) {
            this._checkIfDemoMode();
            this.username = user.username;
            this._checkUserAgreement(user.roles, user.ownerAgreed, user.profile.agreement);
        }
    }

    private _processStoreChanges(state: State) {
        // header actions
        this.hideLayout = state.hideLayout || false;
        this.sideBarOpen = state.sideBarOpen;
    }

    /**
     * check if the route is /users/verify-enrollment/:id to show background signup image
     * @param url
     */
    private _processVerifyEnrollment(url: string): boolean {
        if (!isString(url) || isEmpty(url)) {
            return false;
        }

        const splitUrl: string[] = url.split('/');
        // remove empty string
        splitUrl.shift();

        if (splitUrl.length !== 3) {
            return false;
        }

        const compareToUrl = '/users/verify-enrollment/';
        const verifyEnrollmentUrl = `/${splitUrl[0]}/${splitUrl[1]}/`;

        if (compareToUrl === verifyEnrollmentUrl) {
            return true;
        }

        return false;
    }

    private _processResetPassword(url: string): boolean {
      if (!isString(url) || isEmpty(url)) {
          return false;
      }

      const splitUrl: string[] = url.split('/');
      splitUrl.shift();
      if (splitUrl.length !== 3) {
          return false;
      }

      const compareToUrlResetPwd = '/users/reset-password/';
      const verifyResetPwd = `/${splitUrl[0]}/${splitUrl[1]}/`;

      if (compareToUrlResetPwd === verifyResetPwd) {
          return true;
      }

      return false;
  }

    private _processRouteChange(e: NavigationStart) {
        let hideLayout = false;
        hideLayout = (this._processVerifyEnrollment(e.url) || this._processResetPassword(e.url));

        if (routesWithNoLayout.indexOf(e.url) === 0) {
            hideLayout = true;
        }
        this._storeHelper.update('hideLayout', hideLayout);
    }

    private _startCheckingForNewVersion() {
        const that = this;

        setInterval(function() {
            that._versionService.checkVersionNumber();
        }, VERSION_CHECK_TIMESPAN);
    }

    private _checkIfDemoMode() {
        const that = this;
        this._apolloService.networkQuery(inDemoMode).then(res => {
            that.demoMode = res.inDemoMode;
            that._storeHelper.update('inDemoMode', that.demoMode);
        });
    }

    private _checkUserAgreement(roles: IRole[], ownerAgreed: boolean, agreement: IUserAgreement): void {
        const findOwner = roles.find((role: IRole) => role.name === 'owner');

        const isOwner: boolean = findOwner ? true : false;
        const that = this;

        // don't show agreement due to accepting agreement by owner
        if (ownerAgreed) {
            this._userAgreeSvc.setOwnerAgreed(ownerAgreed);
            return;
        }

        // if the user is an owner show the agreement
        if (isOwner) {
            this.showAgreement = true;
            return;
        }

        // show messsage and logout if owner never agreed to the terms
        const sweetalertOptions: SweetAlertOptions = {
            type: 'info',
            title: 'Account Info',
            text: 'Your account it\'s currently on hold, please contact your admin.',
            allowOutsideClick: false,
            showConfirmButton: false,
            timer: 5000,
            onOpen: () => {
                SweetAlert.showLoading();
            }
        };

        SweetAlert(sweetalertOptions).then(res => {
            if (res.dismiss === 'timer' as any) {
                that._authService.logout();
            }
        });
        return;
    }
}

