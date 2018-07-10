import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'kpi-new-dashboard',
  templateUrl: './new-dashboard.component.pug',
  styleUrls: ['./new-dashboard.component.scss']
})
export class NewDashboardComponent implements OnInit {

  constructor(private _route: Router) { }

  ngOnInit() {
  }

  onAddDashboard() {
    this._route.navigateByUrl('/dashboards/add') ;
  }
}
