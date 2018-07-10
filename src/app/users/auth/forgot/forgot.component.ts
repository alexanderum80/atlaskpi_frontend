import { CommonService } from '../../../shared/services/common.service';
import { Subscription } from 'rxjs/Subscription';
import { AuthenticationService } from '../../../shared/services';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup } from '@angular/forms';

import { UsersService } from '../../shared/services';
import {environment} from '../../../../environments/environment';

@Component({
    selector: 'kpi-forgot-password',
    templateUrl: 'forgot.component.pug'
})
export class ForgotComponent implements OnInit, OnDestroy {
  @Input() fg: FormGroup = new FormGroup({});
  emailSent = false;

    private _emailSentSub: Subscription;
    private _subscription: Subscription[] = [];

    constructor(private _router: Router,
                private _usersSvc: UsersService
               ) { }

    ngOnInit() { }

    ngOnDestroy() {
        CommonService.unsubscribe([
            ...this._subscription,
            this._emailSentSub
        ]);
    }

    resetPassword(e: MouseEvent) {
      if (!this.fg.valid) {
              return;
      }

      const companyName = this.fg.value.companyName ? this.fg.value.companyName : '';

      this._subscription.push(
          this._usersSvc.sendForgotPasswordLink(this.fg.value.email, companyName).subscribe((res) => {
              if (!res) { return; }
              this.emailSent = res.success;
      }));
    }

    navigateHome() {
        this._router.navigate(['']);
    }

    isEmailValid() {
        return this.fg.valid && this.fg.get('email').value;
    }

    backToSignIn(): void {
        this._router.navigate(['/start']);
    }

    get showCompany(): boolean {
        return window.location.hostname === environment.subdomain ||
               window.location.hostname.split('.').length === 3;
    }
}
