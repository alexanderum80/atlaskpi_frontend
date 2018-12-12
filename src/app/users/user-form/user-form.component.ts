import { find, map, join } from 'lodash';
import { IDashboard } from './../../charts/shared/models/dashboard.models';
import { ApolloService } from './../../shared/services/apollo.service';
import gql from 'graphql-tag';
import { SelectionItem } from '../../ng-material-components';
import { generateTimeZoneOptions } from '../../shared/helpers/timezone.helper';
import { CommonService } from '../../shared/services/common.service';
import { Apollo } from 'apollo-angular';
import { UserService } from '../../shared/services/user.service';
import { FormGroup } from '@angular/forms';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { rolesApi } from './graphqlActions/user-form.actions';
import { Subscription } from 'rxjs/Subscription';

const DashboardsQuery = gql `
query Dashboards($group: String!) {
    dashboards(group: $group) {
        _id
        name
        users
        visible
    }
}
`;

@Component({
  selector: 'kpi-user-form',
  templateUrl: './user-form.component.pug',
  styleUrls: ['./user-form.component.scss']
})
export class UserFormComponent implements OnDestroy, OnInit {
  @Input() fg: FormGroup = new FormGroup({});
  
  dashboardList: SelectionItem[] = [];
  allDashboards: any;
  roles: any;
  timeZoneList: SelectionItem[] = generateTimeZoneOptions();
  isOwner: boolean = false;

  private _subscription: Subscription[] = [];

  constructor(private _userService: UserService, 
              private _apollo: Apollo,
              private _apolloService: ApolloService) {
    const that = this;
    this._subscription.push(this._apollo.watchQuery({
      query: rolesApi.all,
      fetchPolicy: 'network-only'
      })
      .valueChanges.subscribe(({data}) => {
        that.roles = (<any>data).findAllRoles;

        if (!that.roles) {
          return;
        }

        setTimeout(() => {
          const semiAdminAssignAllow = this._userService.hasPermission('Assign Smi-Admin', 'Access');
          const adminAssignAllow = this._userService.hasPermission('Assign Admin', 'Access');

          if (!semiAdminAssignAllow) {
            that.roles = that.roles.filter(role => role.name !== 'semiAdmin');
          }

          if (!adminAssignAllow) {
            that.roles = that.roles.filter(role => role.name !== 'admin');
          }
        }, 100);
      }));

      const currentUser = this._userService.user;
      if(currentUser){
        currentUser.roles.forEach(r => {
        if(r.name ==='owner')  this.isOwner = true;
        })
      }
  }

  ngOnInit() {
    this.getDashboards();
  }

  ngOnDestroy() {
    CommonService.unsubscribe(this._subscription);
  }

  updateUserFormValues(user: any) {
    if (user) {
      this.fg.controls['firstName'].setValue(user.profile.firstName || null);
      this.fg.controls['lastName'].setValue(user.profile.lastName || null);
      this.fg.controls['email'].setValue(user.emails[0].address);
      this.fg.controls['timezone'].setValue(user.profile.timezone || null);


      for (let i = 0; i < this.roles.length; i++) {
        const checked = (user.roles.find(role => role.name === this.roles[i].name)) !== undefined;
        this.fg.controls[this.roles[i].name].setValue(checked);
      }

    }


  }

getSelectedDashboards(userid: string): string {
    const dashboardsSelected = [];
    this.allDashboards.map(dash => {
      const isUser = dash.users.find(u => u === userid);
      if (isUser) { dashboardsSelected.push(dash); }
    });
    return dashboardsSelected.map(ds => ds._id).join('|');
}

getDashboards(userid?: string) {
  if(!this.isOwner) return;

  this._apolloService.networkQuery < any > (DashboardsQuery, { group: 'allDashboards' })
  .then(d => {
    this.allDashboards = d.dashboards;
    const selectedDash = this.getSelectedDashboards(userid);
    this.fg.controls['dashboards'].setValue(selectedDash || null);
    this.dashboardList = d.dashboards.map(dash => {
      return {
        id: dash._id,
        title: dash.name,
        selected: false,
        disabled: false
      };
    });
  })
  .catch(err => alert(err));
}

}
