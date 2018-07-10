import {
  AddConnectorActivity
} from '../../shared/authorization/activities/data-sources/add-connector.activity';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NoDataSourcesViewModel } from './no-datasources.viewmodel';
import { UserService } from '../../shared/services';

@Component({
  selector: 'kpi-no-datasources',
  templateUrl: './no-datasources.component.pug',
  styleUrls: ['./no-datasources.component.scss'],
  providers: [NoDataSourcesViewModel, AddConnectorActivity]
})
export class NoDatasourcesComponent implements OnInit {

  constructor(
    private _router: Router,
    private _userService: UserService,
    public vm: NoDataSourcesViewModel,
    public addConnectorActivity: AddConnectorActivity) { }

  ngOnInit() {
    this.vm.addActivities([this.addConnectorActivity]);
  }

  addDataSource() {
    this._router.navigateByUrl('/datasource/listAllDataSourcesComponent');
  }

}
