import { CommonService } from '../../shared/services/common.service';
import { IModalError } from '../../shared/interfaces/modal-error.interface';
import { UserFormComponent } from '../user-form/user-form.component';
import { UsersService } from '../shared/services/users.service';
import { AddEditModel } from '../shared/models/add-edit-user.model';
import { editUserApi } from './graphqlActions/edit-user.actions';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ModalComponent } from '../../ng-material-components';
import { Apollo } from 'apollo-angular';
import { RolesService } from '../../roles/shared/services/roles.service';
import { Subscription } from 'rxjs/Subscription';
import { UserService } from './../../shared/services/user.service';
import { ApolloService } from '../../shared/services/apollo.service';
import { usersApi } from '../shared/graphqlActions/userActions';
import { returnStatement } from 'babel-types';

export interface IUserProfile {
  firstName: string;
  lastName: string;
}

export interface UserInput {
  profile: IUserProfile;
  email: string;
  roles: any[];
}

@Component({
  selector: 'kpi-edit-user',
  templateUrl: './edit-user.component.pug',
  styleUrls: ['./edit-user.component.scss'],
  providers: [RolesService]
})

export class EditUserComponent implements OnInit, OnDestroy {
  @ViewChild('editUser') editUserModal: ModalComponent;
  @ViewChild(UserFormComponent) userForm: UserFormComponent;
  @ViewChild('errorModal') errorModal: ModalComponent;

  fg: FormGroup = new FormGroup({});
  user: any;
  addEditModel: AddEditModel;
  roles: any[];

  selected: string;
  output: string;
  backdropOptions: [true, false, 'static'];
  cssClass: '';
  animation = true;
  keyboard = true;
  backdrop = true;
  css = false;

  lastError: IModalError;
  private _subscription: Subscription[] = [];


  constructor(private _apollo: Apollo,
              private _apolloService: ApolloService,
              private _usersService: UsersService) { }

  ngOnInit() {
    this._usersService.watchChanges(this.fg);
  }

  ngOnDestroy() {
    CommonService.unsubscribe(this._subscription);
  }

  set() {
    const fgEditUser = this.fg.value;
    const that = this;
    const editUserInputVariables = {
      _id: this.user._id,
      firstName: fgEditUser.firstName,
      lastName: fgEditUser.lastName,
      email: fgEditUser.email,
      timezone: fgEditUser.timezone,
      roles: this._usersService.getRoles(this.fg.value)
    };

    this.addEditModel = AddEditModel.Create(editUserInputVariables);

    if (this.addEditModel) {

      this._subscription.push(this._apollo.mutate({
        mutation: editUserApi.update,
        variables: this.addEditModel.ToFormGroup(),
        refetchQueries: [
          'AllUsers'
        ]
      }).subscribe(({data}) => {
        const entity = (data as any).updateUser;

        if (entity.errors && entity.errors.length) {
          that.lastError = {
            title: 'Error adding user',
            msg: 'Email already exists. Please use another email.'
          };
          that.errorModal.open();
          return;
        }

        this.addNewUserinDashBoards(that.fg.value.dashboards, that.fg.value.email);
        that.editUserModal.close();
      }));
    }
  }

  addNewUserinDashBoards(dashboards: string, username: string) {
        const that = this;

        that._apolloService.mutation(usersApi.assignDash, {
          id: dashboards ? dashboards : '',
          userId: this.user._id,
          username: username
        })
        .then(result => { })
        .catch(err => {
          console.log(err);
        });
      }

  getSelectedUser(user: any) {
    this.user = user;
    this.userForm.updateUserFormValues(user);
    this.userForm.getDashboards(user._id)
  }

  isFormValid() {
    return this._usersService.isFormValid(this.fg);
  }

  open() {
    this.editUserModal.open();
  }

  cancel() {
    this.editUserModal.close();
  }

  opened() {
    this.output = '(opened)';
  }

  closed() {
    this.output = '(closed) ' + this.selected;
  }

}
