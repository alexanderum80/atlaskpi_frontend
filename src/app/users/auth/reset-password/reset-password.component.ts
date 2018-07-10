import { CommonService } from '../../../shared/services/common.service';
import { ApolloQueryResult } from 'apollo-client';
import { UsersService } from '../../shared/services';
import { FormGroup } from '@angular/forms';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

@Component({
    selector: 'kpi-reset-password',
    templateUrl: 'reset-password.component.pug',
    styleUrls: ['reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit, OnDestroy {

    fg: FormGroup;
    tokenValid = true;
    passwordResetted= false;
    passwordsMatch: boolean;

    private _token: string;
    private _companyName = '';
    private _subscription: Subscription[] = [];

    constructor(
        private _route: ActivatedRoute,
        private _usersSvc: UsersService,
        private _router: Router) { }

    ngOnInit() {
        const that = this;
        this.fg = new FormGroup({});
        this.passwordsMatch = true;
        // this.passwordResetted =  false;

        that._subscribeToFormChanges();

        this._subscription.push(
            this._route.params
            // save token first
            .do((params: Params) => that._token = params['token'])
            .do((params: Params) => that._companyName = params['companyName'])
            // then verify if it is valid
            .switchMap((params: Params) => this._usersSvc.verifyResetPasswordToken(params['token'], params['companyName']))
            // save if the token is valid
            .subscribe((response: ApolloQueryResult<any>) => {
                that.tokenValid = response.data.isResetPasswordTokenValid.isValid;
            }));

    }

    ngOnDestroy() {
        CommonService.unsubscribe(this._subscription);
    }

    resetPassword() {
        const that = this;

        if (!this.fg.valid) {
            return;
        }
        // that.passwordResetted = false;
        const value = this.fg.value;

        if (value.password !== value.confirmPassword) {
            this.passwordsMatch = false;
            this.fg.controls['confirmPassword'].setValue ('');
            return;
        }
        this.passwordsMatch = true;
        this._subscription.push(
            this._usersSvc.resetPassword(this._token, value.password, false, '', '', that._companyName)
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
