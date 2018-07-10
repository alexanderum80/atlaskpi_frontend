import { CommonService } from '../../shared/services/common.service';
import { Component, AfterViewInit, HostBinding, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { AuthenticationService } from '../../shared/services';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'kpi-auth',
  templateUrl: './auth.component.pug',
})
export class AuthComponent implements OnDestroy {
 @HostBinding('class') classes = 'h-100 layout-row layout-align-center-center';

  fg: FormGroup = new FormGroup({});

  authError = false;

  forgotPassword = false;

  componentAnimation = 'fadeIn';
  passwordReseted = false;

  private _subscription: Subscription[] = [];

  constructor(
    private _authSvc: AuthenticationService,
    private _router: Router
  ) { }

  ngOnDestroy() {
    CommonService.unsubscribe(this._subscription);
  }

  goBackClicked() {
    this._router.navigate(['']);
  }

  register(e: MouseEvent) {
    const that = this;
    this.authError = false;
    const creds = this.fg.value;
    this._subscription.push(this._authSvc.login(creds)
      .subscribe(
        res => {
          that._onSuccesfullAuth(res);
        },
        err =>  {
          that._onErrorAuth(err);
        },
        () => console.log('Auth completed')
      ));
  }

  resetPasswordMode() {
    this.componentAnimation = 'fadeOut';
    setTimeout(() => {
      this.forgotPassword = true;
      this.componentAnimation = 'fadeIn';
    }, 1000);
  }

  private _onSuccesfullAuth(res) {
    this.authError = false;
    setTimeout(() => this._router.navigate(['/dashboards']), 1000);
  }

  private _onErrorAuth(res) {
    this.authError = true;
  }
}
