import { IUserInfo } from '../../shared/models/user';
import { IManageUsers } from '../../users/shared/models';
import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { IAlert, IWidgetAlertUsers, WidgetAlertFormViewModel } from './widget-alert-form.viewmodel';
import {FormGroup, FormArray, FormControl, FormBuilder } from '@angular/forms';
import { Apollo } from 'apollo-angular';
import { IUser } from '../../users/shared/models/user';
import { Subscription } from 'rxjs/Subscription';
import {CommonService} from '../../shared/services/common.service';
import { isEmpty, isNumber } from 'lodash';
import { DeliveryMethodEnum } from '../../alerts/alerts.model';

const usersQuery = require('graphql-tag/loader!./users.query.gql');
const testAlertMutation = require('graphql-tag/loader!./test-widget-alert.gql');

@Component({
  selector: 'kpi-widget-alert-form',
  templateUrl: './widget-alert-form.component.pug',
  styleUrls: ['./widget-alert-form.component.scss'],
  providers: [WidgetAlertFormViewModel]
})
export class WidgetAlertFormComponent implements OnInit, OnDestroy {
  @Input() model: IAlert;
  @Input() users: IUserInfo[];

  private _editId: string;
  private _subscription: Subscription[] = [];

  constructor(
    private _apollo: Apollo,
    private _cdr: ChangeDetectorRef,
    private _fb: FormBuilder,
    public vm: WidgetAlertFormViewModel
  ) {}

  ngOnInit() {
    this.vm.initialize(this.model);
  }

  ngOnDestroy() {
    CommonService.unsubscribe(this._subscription);
  }

  update(model: IAlert): void {
    this.addUserControls(model);
    if (model.notifyUsers && model.notifyUsers.length) {
      model = this.vm.objectWithoutProperties(model, ['__typename']) as any;
      model.notifyUsers = this.transformNotifyUsers(model.notifyUsers);
    }

    if (isEmpty(model)) {
      // by default, set active to true in add/create alert
      model = { active: true } as IAlert;
    }

    this.vm.update(model);
  }

  setEditId(id: string): void {
      this._editId = id;
  }

  addUserControls(model: IAlert): void {
    if (this.users) {
      const that = this;

      this.users.forEach(user => {
        that.vm.alertUsers.push({
          _id: user._id,
          username: this.getUserProfileName(user._id),
          selected: false,
          profilePictureUrl: user.profilePictureUrl,
          profile: user.profile
        });

        if (isEmpty(model)) {
          (that.vm.fg.get('notifyUsers') as FormArray).push(new FormGroup({}));
        }
      });
    }
  }

  transformNotifyUsers(users: any[]): IWidgetAlertUsers[] {
    return this.users
              .map(user => {
                return {
                  _id: user._id,
                  username: this.getUserProfileName(user._id),
                  selected: (users.indexOf(user._id) !== -1) ? true : false,
                  profilePictureUrl: user.profilePictureUrl,
                  profile: user.profile
                };
              });
  }

  getUserProfileName(id: string) {
    if (!id) { return ''; }

    const user = this.users.find(u => u._id === id);
    if (!user) {
      return '';
    }

    if (!isEmpty(user.profile) && user.profile.firstName) {
      return `${user.profile.firstName} ${user.profile.lastName}`;
    } else {
      return user.username;
    }
  }

  getUserAvatar(index: number): any {
    const user = this.users[index];
    if (user.profilePictureUrl) {
      return user.profilePictureUrl;
    }

    if (user.profile && user.profile.firstName) {
      return `${user.profile.firstName[0].toUpperCase()}${user.profile.lastName[0].toUpperCase()}`;
    }

    return '';
  }

  getUserIntials(id: string): string {
    if (!id) {
      return '';
    }

    const user = this.users.find(u => u._id === id);
    if (!user) {
      return '';
    }

    if (user.profile && user.profile.firstName) {
      return `${user.profile.firstName[0].toUpperCase()}${user.profile.lastName[0].toUpperCase()}`;
    }
  }

  getUserId(index: number): string {
    const user = this.users[index];
    return user._id;
  }

  disableNotifications(fg: FormGroup): boolean {
    return fg.get('active').value ? false : true;
  }

  get showAlertForm(): boolean {
    return isEmpty(this.vm.fg.controls);
  }

  get editId(): string {
    return this._editId;
  }

  get canTestAlert() {
      const value = this.vm.payload;
      return value.notifyUsers.length && (value.emailNotified || value.pushNotification);
  }

  testAlert() {
    const value = this.vm.payload;
    const deliveryMethods = [];

    if (value.emailNotified) { deliveryMethods.push(DeliveryMethodEnum.email); }
    if (value.pushNotification) { deliveryMethods.push(DeliveryMethodEnum.push); }

    return this._apollo.mutate({
        mutation: testAlertMutation,
        variables: { users: value.notifyUsers, deliveryMethods }
    });
  }

}
