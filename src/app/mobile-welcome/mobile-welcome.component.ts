import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IMenuItem } from '../shared/models';

@Component({
  selector: 'app-mobile-welcome',
  templateUrl: './mobile-welcome.component.pug',
  styleUrls: ['./mobile-welcome.component.scss']
})
export class MobileWelcomeComponent {

    navItems: IMenuItem[] = [
        { title: 'Main Dashboard', icon: 'zmdi-view-dashboard', route: '/dashboards' },
        { title: 'Calendar', icon: 'zmdi-calendar', route: '/appointments/list' },
        { title: 'Notifications', icon: 'zmdi-notifications', route: '/notifications' },
    ];

  constructor(private _router: Router) { }

  navigateTo(address: string) {
    this._router.navigate([address]);
  }

}
