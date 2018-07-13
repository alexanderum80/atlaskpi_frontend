import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'kpi-notifications',
  template: `<h1>Notifications</h1><router-outlet></router-outlet>`,
})
export class NotificationsComponent implements OnInit {

  constructor(private _router: Router) { }

  ngOnInit() {
    this._router.navigateByUrl('dashboards');
  }

}
