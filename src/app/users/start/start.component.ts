import { LocalStorageService } from '../../shared/services/local-storage.service';
import { WindowService } from '../../shared/services/window.service';
import { BrowserService } from '../../shared/services/browser.service';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { AuthenticationService } from '../../shared/services/';

const ViewsMap = {
    Signin: 'signIn',
    Signup: 'signUp'
};

@Component({
  selector: 'kpi-start',
  templateUrl: './start.component.pug',
  styleUrls: ['./start.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class StartComponent implements OnInit {

    subdomainPresent = false;
    signUpPosition = 'front';
    signInPosition = 'back';
    mobile: boolean;
    flipped = false;

    accountCreationStarted = false;
    accountCreated = false;

    private _activeView = ViewsMap.Signup;

    constructor(browser: BrowserService,
                private _authSvc: AuthenticationService,
                private _window: WindowService,
                private _localStorageSvc: LocalStorageService) {
        this.mobile = browser.isMobile();
    }

    ngOnInit() {
        this._authSvc.logout();
        const previousCredentials = this._localStorageSvc.getCompanyInfo() !== null;
        const hostname = this._window.nativeWindow.location.hostname;

        this.subdomainPresent = hostname.split('.').length > 3 && isNaN(hostname[0] as any);

        if (this.subdomainPresent || previousCredentials) {
            this.signUpPosition = 'back';
            this.signInPosition = 'front';
            this._activeView = ViewsMap.Signin;
            this.flipped = true;
        }
    }

    signupClicked(item?: any) {
        this.flipped = false;
        if (!this.mobile) {
            setTimeout(() => {
                this.toggle(item);
            }, 0);
        }
    }

    signinClicked(item?: any) {
        this.flipped = true;
        if (!this.mobile) {
            setTimeout(() => {
                this.toggle(item);
            }, 0);
        }

        this.accountCreationStarted = false;
        this.accountCreated = false;
    }

    toggle(view) {
        if (this._activeView === view) {
            return;
        }

        if (view === ViewsMap.Signin) {
            this._switchView(ViewsMap.Signin, ViewsMap.Signup);
        } else {
            this._switchView(ViewsMap.Signup, ViewsMap.Signin);
        }

    }

    private _switchView(frontView, backView) {
        const that = this;
        const suffix = 'Position';

        this.signUpPosition = '';
        this.signInPosition = '';
        this._activeView = frontView;

        that[backView + suffix] = 'behind';

        setTimeout(() => {
            that[frontView + suffix] = 'front';
            that[backView + suffix] = 'back';
        }, 350);
    }

}
