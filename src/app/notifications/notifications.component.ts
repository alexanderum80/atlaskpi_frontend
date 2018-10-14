import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'kpi-notifications',
  template: `<router-outlet></router-outlet>`,
})
export class NotificationsComponent implements OnInit {

  constructor(private _router: Router) { }

  ngOnInit() {
    // this._router.navigateByUrl('dashboards');
  }

}
