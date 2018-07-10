import { IPermission } from '../../permissions/shared/models/index';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Apollo } from 'apollo-angular';
import { groupBy, cloneDeep } from 'lodash';
import { titleCase } from 'change-case';

import { RolesService } from '../shared/services/roles.service';
import { ApolloService } from '../../shared/services/apollo.service';
import { IRole } from '../../users/shared/index';
import { AfterViewInit } from '@angular/core/src/metadata/lifecycle_hooks';

const roleByNameQuery = require('../shared/graphql/role-by-name.gql');

@Component({
  selector: 'kpi-role-form',
  templateUrl: './role-form.component.pug',
  styleUrls: ['./role-form.component.scss']
})
export class RoleFormComponent implements OnInit, AfterViewInit {

  @Input() role: any;
  @Input() fg: FormGroup = new FormGroup({});

  @Output() parentRole = new EventEmitter<any>();

  permissions: any;
  groupPermissions: any;
  permissionKeys: any;

  // permissions
  Chart = false;
  Widget = true;
  Targets = true;
  Data = true;
  KPI = true;
  SecurityLog = true;
  Feed = true;
  DataEntry = true;
  DataSource = true;
  DashboardTab = true;
  BusinessUnits = true;
  Users = true;
  Roles = true;
  Billing = true;
  Access = true;
  Milestones = true;
  Slideshows = true;
  SmartBar = true;
  Appointments = true;

  constructor(private _apollo: Apollo, private _roleService: RolesService,
    private _apolloService: ApolloService) {
    const that = this;
    this._roleService.getPermissions()
      .then(({data}) => {
        that.permissions = (<any>data).findAllPermissions;

        const labelFriendlyPermissions = cloneDeep(that.permissions) as IPermission[];
        labelFriendlyPermissions.forEach(c => {
          c.action = titleCase(c.action);
        });

        that.groupPermissions = groupBy(labelFriendlyPermissions, 'subject');
      });
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this._roleService.updateExistDuplicatedName(false);
    this._subscribeToNameChanges();
  }

  updateRoleFormValues(role: any) {
    if (role) {
      this.fg.controls['name'].setValue(role.name);

      for (let i = 0; i < this.permissions.length; i++) {
        const checked = role.permissions.indexOf(this.permissions[i]._id) !== -1;
        const control = this.fg.controls[this.permissions[i]._id];

        if (control) {
          control.setValue(checked);
        }
      }
    }
  }

  private _subscribeToNameChanges() {
    this.fg.controls['name'].valueChanges.subscribe(n => {
        if (n === '') {
            this.fg.controls['name'].setErrors({required: true});
        } else {
            if (this._roleService.getExistDuplicatedName() === true) {
                this._apolloService.networkQuery < IRole > (roleByNameQuery, { name: n }).then(d => {
                    if (d.roleByName && d.roleByName._id !== (this.role ? this.role._id : 0)) {
                      this.fg.controls['name'].setErrors({forbiddenName: true});
                    } else {
                      this.fg.controls['name'].setErrors(null);
                    }
                });
            }
        }
    });
  }


}
