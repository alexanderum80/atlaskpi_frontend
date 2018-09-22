import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { Subscription } from 'rxjs/Subscription';

import { AuthenticationService } from '../../shared/services';
import { BrowserService } from '../../shared/services/browser.service';
import { CommonService } from '../../shared/services/common.service';
import { ICompanyInfo, LocalStorageService } from '../../shared/services/local-storage.service';

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
    mobile: boolean;
    companyInfo: ICompanyInfo;

    private _subscription: Subscription[] = [];

    constructor(browser: BrowserService,
        private _authSvc: AuthenticationService,
        private _router: Router,
        private _localStorageSvc: LocalStorageService,
        private _apollo: Apollo) {
        this.mobile = browser.isMobile();
    }

    ngOnInit() {
        this.companyInfo = this._localStorageSvc.getCompanyInfo() || { companyName: '', email: '', subdomain: '', fullName: '' };
    }

    ngAfterViewInit() {
        const that = this;
    }

    ngOnDestroy() {
        CommonService.unsubscribe(this._subscription);
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
            this._router.navigate(['/dashboards']);
        }, (err) => {
            that.authError = true;
        }));
    }

}
