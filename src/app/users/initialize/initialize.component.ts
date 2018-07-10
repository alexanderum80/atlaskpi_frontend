import { CommonService } from '../../shared/services/common.service';
import { ActivatedRoute } from '@angular/router';
import { AuthenticationService } from '../../shared/services';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'kpi-users-initialize',
  templateUrl: './initialize.component.pug',
})
export class InitializeComponent implements OnInit, OnDestroy {
    private _subscription: Subscription[] = [];

    constructor(private _authService: AuthenticationService,
                private _route: ActivatedRoute) { }

    ngOnInit() {
        this._subscription.push(this._route.params.map(params => params['base64token'])
            .subscribe((base64token) => {
            this.setInitialToken(base64token);
        }));
    }

    ngOnDestroy() {
        CommonService.unsubscribe(this._subscription);
    }

    setInitialToken(base64token: string) {
        this._authService.setInitialToken(JSON.parse(atob(base64token)));
    }
}
