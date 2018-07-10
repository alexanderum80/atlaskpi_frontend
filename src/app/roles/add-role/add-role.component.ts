import { CommonService } from '../../shared/services/common.service';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Apollo } from 'apollo-angular';
import { Subscription } from 'rxjs/Subscription';

import { ModalComponent } from '../../ng-material-components';
import { RoleFormComponent } from '../role-form/role-form.component';
import { RoleModel } from '../shared/models/index';
import { RolesService } from '../shared/services/roles.service';
import { addRoleApi } from './graphqlActions/add-role.actions';
import { IRole } from '../../users/shared/index';
import { ApolloService } from '../../shared/services/apollo.service';
import Sweetalert from 'sweetalert2';

const roleByNameQuery = require('../shared/graphql/role-by-name.gql');

@Component({
  selector: 'kpi-add-role',
  templateUrl: './add-role.component.pug',
  styleUrls: ['./add-role.component.scss'],
  providers: [RolesService]
})

export class AddRoleComponent implements OnInit, OnDestroy {
  @ViewChild('addRoleModal') addRoleModal: ModalComponent;
  @ViewChild(RoleFormComponent) roleForm: RoleFormComponent;

  permissions: any[];
  fg: FormGroup = new FormGroup({});
  roleModel: RoleModel;

  backdrop = true;
  cssClass: '';

  private _subscription: Subscription[] = [];

  constructor(private _apollo: Apollo, private _roleService: RolesService,  private _apolloService: ApolloService,) { }

  ngOnInit() {
    this._roleService.watchChanges(this.fg);
  }

  ngOnDestroy() {
    CommonService.unsubscribe(this._subscription);
  }

  set() {
    const that = this;
    const roleGroup = {
      name: this.fg.value.name,
      permissions: this._roleService.updatePermissionsList(this.fg.value)
    };

    this._roleService.updateExistDuplicatedName(false);

    this._apolloService.networkQuery < IRole > (roleByNameQuery, { name: this.fg.controls['name'].value }).then(d => {
      if (d.roleByName) {

          this._roleService.updateExistDuplicatedName(true);

          this.fg.controls['name'].setErrors({forbiddenName: true});

          return Sweetalert({
              title: 'Duplicated name!',
              text: 'You already have a Role with that name. Please change the name and try again.',
              type: 'error',
              showConfirmButton: true,
              confirmButtonText: 'Ok'
          });
      }

      this.roleModel = RoleModel.Create(roleGroup);

      if (this.roleModel) {
         this._subscription.push(this._apollo.mutate({
          mutation: addRoleApi.create,
          variables: this.roleModel.ToFormGroup(),
          refetchQueries: [
            'Roles'
          ]
        }).subscribe((response) => {
          this.fg.reset();
          that.addRoleModal.close();
        }));
      }
    });
  }

  isFormValid(): boolean {
    return this._roleService.isFormValid(this.fg);
  }

  open(): void {
    this.addRoleModal.open();
  }

  cancel(): void {
    this.addRoleModal.close();
  }

  modalClose(): void {
    this.addRoleModal.close();
  }

}
