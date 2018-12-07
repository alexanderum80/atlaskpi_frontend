import { CommonService } from '../../shared/services/common.service';
import { IModalError } from '../../shared/interfaces/modal-error.interface';
import { addUserApi } from './graphqlActions/add-user.actions';
import { RolesService } from '../../roles/shared/services/roles.service';
import { UsersService } from '../shared/services/users.service';
import { AddEditModel } from '../shared/models/add-edit-user.model';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Apollo } from 'apollo-angular';
import { ModalComponent } from '../../ng-material-components';
import { Subscription } from 'rxjs/Subscription';
import { ApolloService } from '../../shared/services/apollo.service';
import { usersApi } from '../shared/graphqlActions/userActions';

@Component({
  selector: 'kpi-add-user',
  templateUrl: './add-user.component.pug',
  styleUrls: ['./add-user.component.scss'],
  providers: [RolesService]
})
export class AddUserComponent implements OnInit, OnDestroy {
  @ViewChild('addUser') addUserModal: ModalComponent;
  @ViewChild('errorModal') errorModal: ModalComponent;

  fg: FormGroup = new FormGroup({});
  addEditModel: AddEditModel;
  roles: any[];
  userValid = false;

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

  set(): void {
    const that = this;
    const addUserInput = {
      firstName: this.fg.value.firstName,
      lastName: this.fg.value.lastName,
      email: this.fg.value.email,
      timezone: this.fg.value.timezone,
      roles: this._usersService.getRoles(this.fg.value)
    };

    this.addEditModel = AddEditModel.Create(addUserInput);

    if (this.addEditModel) {
      this._subscription.push(this._apollo.mutate({
        mutation: addUserApi.create,
        variables: this.addEditModel.ToFormGroup(),
        refetchQueries: [
          'AllUsers'
        ]
      }).subscribe(({data}) => {
        const entity = (data as any).createUser;

        if (entity.errors && entity.errors.length) {
          that.lastError = {
            title: 'Error adding user',
            msg: 'Email already exists. Please use another email.'
          };
          that.errorModal.open();
          return;
        }

        this.addNewUserinDashBoards(that.fg.value.dashboards, this.fg.value.firstName, this.fg.value.lastName);
        that.addUserModal.close();
        that.resetData();
      }));
    }
  }

  addNewUserinDashBoards(dashboards: string, firstname: string, lastname: string) {
      const that = this;

      if(!dashboards){
        return;
      }

      that._apolloService.mutation(
        usersApi.assignDash, {
        id: dashboards ? dashboards : '',
        input: firstname + '|' + lastname
      })
      .then(result => {})
      .catch(err => {
        debugger;
        console.log(err);
      });
    }

  resetData(): void {
    const userFg = this.fg.value;
    setTimeout(() => {
      for (const i in userFg) {
        if (userFg[i]) {
          this.fg.controls[i].reset();
        }
      }
    }, 0);
  }

  isFormValid(): boolean {
    return this._usersService.isFormValid(this.fg);
  }

  open(): void {
    this.addUserModal.open();
  }

  cancel(): void {
    this.addUserModal.close();
  }

  opened(): void {
    this.output = '(opened)';
  }

  closed(): void {
    this.output = '(closed) ' + this.selected;
  }

}
