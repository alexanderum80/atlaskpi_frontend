import { CommonService } from '../../shared/services/common.service';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Apollo } from 'apollo-angular';
import { Subscription } from 'rxjs/Subscription';

import { ModalComponent } from '../../ng-material-components';
import { RoleFormComponent } from '../role-form/role-form.component';
import { RoleModel } from '../shared/models';
import { IRole } from '../shared/role';
import { RolesService } from '../shared/services/roles.service';
import { editRoleApi } from './graphqlActions/edit-role.actions';
import { ApolloService } from '../../shared/services/apollo.service';
import Sweetalert from 'sweetalert2';

const roleByNameQuery = require('graphql-tag/loader!../shared/graphql/role-by-name.gql');

@Component({
  selector: 'kpi-edit-role',
  templateUrl: './edit-role.component.pug',
  styleUrls: ['./edit-role.component.scss'],
  providers: [RolesService]
})

export class EditRoleComponent implements OnInit, OnDestroy {
  @ViewChild(RoleFormComponent) roleForm: RoleFormComponent;
  @ViewChild('editRoleModal') editRoleModal: ModalComponent;

  fg: FormGroup = new FormGroup({});

  backdrop = true;
  cssClass: '';

  permissions: any[];
  role: any;
  roleModel: RoleModel;

  private _subscription: Subscription[] = [];

  constructor(private _apollo: Apollo, private _roleService: RolesService, private _apolloService: ApolloService) { }

  ngOnInit() {
    this._roleService.watchChanges(this.fg);
  }

  ngOnDestroy() {
    CommonService.unsubscribe(this._subscription);
  }

  editRole() {
    const that = this;

    const updateRoleInput = {
      _id: this.role._id,
      name: this.fg.value.name,
      permissions: this._roleService.updatePermissionsList(this.fg.value)
    };

    this._roleService.updateExistDuplicatedName(false);

    this._apolloService.networkQuery < IRole > (roleByNameQuery, { name: updateRoleInput.name }).then(d => {
      if (d.roleByName && d.roleByName._id !== updateRoleInput._id) {

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

      this.roleModel = RoleModel.Create(updateRoleInput);

      if (this.roleModel) {
        this._subscription.push(this._apollo.mutate({
          mutation: editRoleApi.update,
          variables: this.roleModel.ToFormGroup(),
          refetchQueries: [
            'Roles',
            'AllUsers'
          ]
        }).subscribe(({data}) => {
            that.modalClose();
        }));
      }
    });
  }

  getSelectedRole(role: IRole): void {
    if (!role) { return; }
    this.role = role;
    this.roleForm.updateRoleFormValues(role);
  }

  isFormValid(): boolean {
    return this._roleService.isFormValid(this.fg);
  }

  open() {
    this.editRoleModal.open();
  }

  cancel() {
    this.editRoleModal.close();
  }

  modalClose() {
    this.editRoleModal.close();
  }
}
