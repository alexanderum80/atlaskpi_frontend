import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'kpi-notifications',
  template: `<h1>Notifications</h1><router-outlet></router-outlet>`,
})
export class NotificationsComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
