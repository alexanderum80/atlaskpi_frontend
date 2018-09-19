import { CommonService } from '../../../shared/services/common.service';
import { AuthenticationService } from '../../../shared/services';
import { SelectionItem } from '../../../ng-material-components';
import { IUserProfile } from '../../../shared/models';
import { ApolloQueryResult } from 'apollo-client';
import { UsersService } from '../../shared/services';
import { FormGroup } from '@angular/forms';
import {Component, OnInit, OnDestroy} from '@angular/core';
import {ActivatedRoute, Params, Router} from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

@Component({
    selector: 'kpi-verify-enrollment',
    styleUrls: ['./verify-enrollment.component.scss'],
    templateUrl: 'verify-enrollment.component.pug'
})
export class VerifyEnrollmentComponent implements OnInit, OnDestroy {

    fg: FormGroup;
    tokenValid = true;
    passwordResetted =  false;
    passwordsMatch: boolean;
    profileInfo: IUserProfile;

    private _token: string;
    private _subscription: Subscription[] = [];

    constructor(
        private _route: ActivatedRoute,
        private _usersSvc: UsersService,
        private _authSvc: AuthenticationService,
        private _router: Router) { }

    ngOnInit() {

        const that = this;
        this.fg = new FormGroup({});

        that._subscribeToFormChanges();

        this._subscription.push(
            this._route.params
            // save token first
            .do((params: Params) => that._token = params['token'])
            // then verify if it is valid
            .switchMap((params: Params) => this._usersSvc.verifyEnrollmentToken(params['token']))
            // save if the token is valid
            .subscribe((response: ApolloQueryResult<any>) => {
                that.tokenValid = response.data.isEnrollmentTokenValid.isValid;
                that.profileInfo = {
                    firstName: response.data.isEnrollmentTokenValid.profile ?
                                response.data.isEnrollmentTokenValid.profile.firstName : null,
                    lastName: response.data.isEnrollmentTokenValid.profile ?
                                response.data.isEnrollmentTokenValid.profile.lastName : null
                };
                that.fg.patchValue(that.profileInfo);
            }));

        if (!this._token) {
            this._authSvc.logout();
        }
    }

    ngOnDestroy() {
        CommonService.unsubscribe(this._subscription);
    }

    resetPassword() {
        const that = this;

        if (!this.fg.valid) {
            return;
        }

        const value = this.fg.value;

        if (value.password !== value.confirmPassword) {
          this.passwordsMatch = false;
          this.fg.controls['confirmPassword'].setValue ('');
          return;
        }

        if (!value.firstName || !value.lastName) {
            return;
        }

        this.passwordsMatch = true;

        this._subscription.push(
            this._usersSvc.resetPassword(this._token, value.password, true, value.firstName, value.lastName)
            .subscribe((res) => {
                if (!res) { return; }
                that.passwordResetted = res.success;
            }));
    }

    navigateLogin() {
        this._router.navigate(['/start']);
    }

    get isPasswordsEmpty(): boolean {
      return (this.fg.value['password'] === '' || this.fg.value['confirmPassword'] === '');
    }

    private _subscribeToFormChanges() {
      const that = this;

      that.fg.valueChanges
      .subscribe(() => {
        if (that.fg.value['password'] === that.fg.value['confirmPassword']) {
          this.passwordsMatch = true;
        }
      });
    }



}

