import { IUser } from '../../../users/shared/models';
import { ApolloService } from '../../../shared/services/apollo.service';
import { UserService } from '../../../shared/services';
import { Component, OnInit, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { DashboardService } from '../../index';
import { SelectionItem } from '../../../ng-material-components/index';

const usersQuery = require('graphql-tag/loader!../../../users/shared/graphql/get-all-users.gql');

@Component({
  selector: 'kpi-dashboard-filter-form',
  templateUrl: './dashboard-filter-form.component.pug',
  styleUrls: ['./dashboard-filter-form.component.scss']
})
export class DashboardFilterFormComponent implements OnInit {
  @Input() accessLevel: FormGroup;
  @Input() usersList: SelectionItem[];

  accessTypesList: SelectionItem[];

  constructor(
    private _dashboardService: DashboardService,
    private _apolloService: ApolloService
  ) {}

  ngOnInit() {
    // this.getUsersList();
    this.getAccessTypesList();
  }

  getAccessTypesList() {
    this.accessTypesList = this._dashboardService.accessTypesItems;
  }


}
