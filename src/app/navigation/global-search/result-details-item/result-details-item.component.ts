import { ApolloService } from '../../../shared/services/apollo.service';
import { Router } from '@angular/router';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { IResultGroup } from '../shared/models/result-groups';
import { IResultDetails } from '../shared/models/result-details';
import { GlobalSearchComponent } from '../global-search.component';
import { EditUserComponent } from '../../../users/edit-user';
import { IManageUsers } from '../../../users/shared';
import { IRole } from '../../../roles/shared/role';
import { EditRoleComponent } from '../../../roles/edit-role/edit-role.component';

const userQuery = require('graphql-tag/loader!../../../users/shared/graphql/get-all-users.gql');
const rolesQuery = require('graphql-tag/loader!../../../roles/graphql/get-roles.query.gql');

@Component({
  selector: 'kpi-result-details-item',
  templateUrl: './result-details-item.component.pug',
  styleUrls: ['./result-details-item.component.scss']
})

export class ResultDetailsItemComponent implements OnInit {
  @Input() groupItem: any;

  @ViewChild(EditUserComponent) editUserComponent: EditUserComponent;
  @ViewChild(EditRoleComponent) editRoleComponent: EditRoleComponent;

  constructor(private _router: Router,
              private _apolloService: ApolloService,
              private _globalSearchComponent: GlobalSearchComponent) { }

  ngOnInit() {
  }

  gotoLink(group: IResultGroup, item: IResultDetails) {
    if (group.uriFormat !== '') {
      switch (group.name) {
        case 'Users':
          this._apolloService.networkQuery < IManageUsers[] > (userQuery).then(u => {
            u.allUsers.map(element => {
              if (element._id === item.id) {
                if (!element) { return; }
                this.editUserComponent.getSelectedUser(element);
                this.editUserComponent.open();
              }
          });
          });
          break;

        case 'Roles':
          this._apolloService.networkQuery < IRole[] > (rolesQuery).then(d => {
            d.findAllRoles.forEach(element => {
                if (element._id === item.id) {
                    if (!element) { return; }
                    this.editRoleComponent.getSelectedRole(element);
                    this.editRoleComponent.open();
                }
            });
          });
          break;

        default:
          this._router.navigate([group.uriFormat, item.id]);
          break;
      }
      this._globalSearchComponent.hideGlobalSearch();
    }
  }



}
