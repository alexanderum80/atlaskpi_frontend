import { CommonService } from '../../shared/services/common.service';
import { UsersService } from '../shared/services/users.service';
import { SignupModel } from '../shared/models';
import { BrowserService } from '../../shared/services/browser.service';
import { FormGroup } from '@angular/forms';
import { AfterViewInit, Component, EventEmitter, OnDestroy, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { SignupService } from '../shared/services';
import { Observable } from 'rxjs/Observable';
import * as changeCase from 'change-case';
import { Subscription } from 'rxjs/Subscription';

@Component({
    selector: 'kpi-sign-up',
    templateUrl: './sign-up.component.pug',
    styleUrls: ['./sign-up.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class SignUpComponent implements AfterViewInit, OnDestroy {
    @Output() signinClicked = new EventEmitter();
    @Output() accountCreationStarted = new EventEmitter();
    @Output() accountCreated = new EventEmitter();

    creatingAccount = false;
    accountReady = false;
    error: string;
    authorizationCode = false;
    leadCreated = false;

    accountNameAvailable = true;
    signupModel: SignupModel = new SignupModel();

    fg = new FormGroup({});
    mobile: boolean;
    formValid: boolean;
    formInfo = false;

    private _subscription: Subscription[] = [];

    constructor(browser: BrowserService,
                private _svc: SignupService,
                private _usersSvc: UsersService) {
        this.mobile = browser.isMobile();
    }

    ngOnDestroy() {
        CommonService.unsubscribe(this._subscription);
    }

    ngAfterViewInit() {
        const that = this;
        this._subscribeToFormChanges();
        this._subscription.push(
            this._svc.accountNameAvailable$.subscribe(available => that.accountNameAvailable = available)
        );
        this.isFormValid();
    }

    goToSignin(e: Event) {
        if (e) {
            e.preventDefault();
        }
        this.signinClicked.emit('signIn');

        this.creatingAccount = false;
        this.accountReady = false;
        this.authorizationCode = false;
        this.leadCreated = false;
    }

    switchToAuthorize(e: Event) {
        e.preventDefault();
        this.authorizationCode = true;
    }

    backToSignUp(e: Event) {
        e.preventDefault();
        this.authorizationCode = false;
    }

    signUp() {
        const that = this;
        this.accountCreationStarted.emit();
        this.creatingAccount = true;

        this._subscription.push(
            this._svc.createAccount(this.signupModel.toAccountDetails()).subscribe((response: any) => {
            if (response.errors) {
                return that._errorCreatingAccount();
            }

            if (!response.entity) {
                // lead created
                that.leadCreated = true;
                return;
            }

            const token = response.entity.initialToken;
            const base64token = btoa(JSON.stringify(token));
            that._accountCreated(response.entity.subdomain, base64token);
        }));
    }

    redirectToSubdomain(subdomain: string, base64token: string) {
        let schema = 'http';

        if (subdomain === 'bi.atlaskpi.com') {
            schema = 'https';
        }

        setTimeout(() => window.location.href = `${schema}://${subdomain}/#/users/initialize/${base64token}`, 1000);
    }

    isFormValid() {
        this._subscription.push(this.fg.valueChanges
            .debounceTime(10)
            .subscribe(form => {
                this.formValid = form.accountName !== '' &&
                    this.accountNameAvailable && form.email !== '' && this.fg.valid;
            }));
    }

    get authorizedCodeEntered() {
        return this.fg.value.authorizationCode !== '';
    }

    signUpInfoClick(item) {
        this.formInfo = !this.formInfo;
    }

    private _errorCreatingAccount() {
        this.creatingAccount = false;
        this.accountReady = false;
        this.error = 'We are having some issues creating an account for you. Please try again in a few';
    }

    private _accountCreated(subdomain: string, base64token: string) {
        const that = this;

        // do effect
        this.creatingAccount = false;
        this.accountReady = true;

        setTimeout(function() {
            that.accountCreated.emit();

            setTimeout(function() {
                that.redirectToSubdomain(subdomain, base64token);
            }, 500);
        }, 1000);
    }

    private _subscribeToFormChanges() {
     this._subscription.push(this.fg.valueChanges
        .debounceTime(500)
        .subscribe(form => {
            if (this.signupModel.accountName !== form.accountName) {
                this._svc.verifyNameAvailability(form.accountName);
                this.signupModel.accountName = form.accountName;
            }

            this.signupModel.email = form.email;
            if (form.firstName && form.lastName) {
                this.signupModel.fullname = form.firstName + '.' + form.lastName;
            }

            this.signupModel.authorizationCode = form.authorizationCode;
        }));
    }
}
