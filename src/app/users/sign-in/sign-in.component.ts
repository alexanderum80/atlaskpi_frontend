import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { Subscription } from 'rxjs/Subscription';

import { AuthenticationService, NativeChannelService, WindowService } from '../../shared/services';
import { BrowserService } from '../../shared/services/browser.service';
import { CommonService } from '../../shared/services/common.service';
import { ICompanyInfo, LocalStorageService } from '../../shared/services/local-storage.service';
import { browser } from 'protractor';

const findByUserNameQuery = require('graphql-tag/loader!./find-by-username.query.gql');


export interface IAuthErrorMessage {
    name: string;
    message: string;
}

export interface ISignIn {
    username: string;
    password: string;
    host?: string;
}

@Component({
    selector: 'kpi-sign-in',
    templateUrl: './sign-in.component.pug',
    styleUrls: ['./sign-in.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class SignInComponent implements OnInit, OnDestroy, AfterViewInit {
    @Input() requireCompanyName = false;
    @Output() signupClicked = new EventEmitter < any > ();

    authError = false;
    authErrorMessage = 'Invalid credentials';

    fg = new FormGroup({});
    isMobile: boolean;
    companyInfo: ICompanyInfo;
    password: string;

    private _subscription: Subscription[] = [];

    constructor(
        private _browserSvc: BrowserService,
        private _authSvc: AuthenticationService,
        private _router: Router,
        private _localStorageSvc: LocalStorageService,
        private _nativeChannelSvc: NativeChannelService,
        private _windowService: WindowService) {
        this.isMobile = _browserSvc.isMobile();
    }

    ngOnInit() {
        this.companyInfo = this._localStorageSvc.getCompanyInfo() || { companyName: '', email: '', subdomain: '', fullName: '' };
        this._windowService.atlasInterop.loginWithPassword = (password: string) => {
            this.fg.get('password').setValue(password);
            this.signIn(null);
        };
    }

    ngAfterViewInit() {
        this._nativeChannelSvc.loginRequired(this.companyInfo);
    }

    ngOnDestroy() {
        CommonService.unsubscribe(this._subscription);
        delete(this._windowService.atlasInterop.loginWithPassword);
    }

    goToSignup(e: Event): void {
        this.signupClicked.emit('signUp');
    }

    signIn(e: MouseEvent) {
        if (!this.fg.valid) {
            return;
        }

        this._userSignIn();
    }

    forgotPassword(e) {
        e.preventDefault();
        this._router.navigate(['/users', 'forgot-password']);
    }

    get canSignIn(): boolean {
        return this.fg.valid;
    }

    private _userSignIn(): void {
        const that = this;

        this.authError = false;
        const credentials = this.fg.value;

        this._subscription.push(this._authSvc.login(credentials).subscribe(() => {
            if (this._browserSvc.isMobile()) {
                this._router.navigate(['/mobile-menu']);
            } else {
                this._router.navigate(['/dashboards']);
            }
        }, (err) => {
            that.authError = true;
        }));
    }

}
