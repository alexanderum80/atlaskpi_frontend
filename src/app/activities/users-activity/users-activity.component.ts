import { ApolloService } from '../../shared/services/apollo.service';
import { Component, Input, OnInit } from '@angular/core';
import { IUsersActivity } from '../shared/models/activity-models';
import * as moment from 'moment';
import { isEmpty, isNumber, pick } from 'lodash';

enum EnumActivityAction {
  CREATE = 'created',
  MODIFIED = 'modified',
  DELETED = 'deleted'
}

enum EnumActivityType {
  TARGET = 'Target',
  ROLE = 'Role',
  USER = 'User'
}

@Component({
  selector: 'kpi-users-activity',
  templateUrl: './users-activity.component.pug',
  styleUrls: ['./users-activity.component.scss']
})
export class UsersActivityComponent implements OnInit {
  @Input() activity: IUsersActivity;

  viewDetails = false;
  fullName: string;
  action: string;
  type: string;
  roleName: string;
  userName: string;
  targetName: string;
  targetDate: Date;
  targetAmount: number;
  targetStackName: string;

  constructor(private _apolloService: ApolloService) { }

  ngOnInit() {
    this.fullName = this.activity.accessBy;
    this.getAction();
    this.getType();
    this.getData();
  }

  getAction() {
    const event = this.activity.event.substr(0, 6);
    switch (event) {
      case 'Create': {
        this.action = EnumActivityAction.CREATE;
        break;
      }
      case 'Update': {
        this.action = EnumActivityAction.MODIFIED;
        break;
      }
      case 'Modify': {
        this.action = EnumActivityAction.MODIFIED;
        break;
      }
      case 'Delete': {
        this.action = EnumActivityAction.DELETED;
        break;
      }
      case 'Remove': {
        this.action = EnumActivityAction.DELETED;
        break;
      }
    }
  }

  getType() {
    const array = ['Mutation', 'Create', 'Update', 'Modify', 'Delete', 'Remove'];
    this.type = this.activity.event;
    array.map(a => {
      this.type = this.type.replace(a, '');
    });
  }

  getData() {
    const array = ['"', '\"'];
    let payload = this.activity.payload;
    array.map(a => {
      payload = payload.replace(/{a}/g, '');
    });
    let data = payload.split(':{');

    if (this.type === 'Role') {
      if (data[2]) {
        data = data[2].split(':');
      }
      data = data[1].split(',');
      this.roleName = data[0].replace(/"/g, '');
    }

    if (this.type === 'User') {
      data = data[data.length - 1].split(',');
      const firstName = data[0].replace(/firstName/, '').replace(/"/g, '').replace(/:/, '');
      const lastName = data[1].replace(/lastName/, '').replace(/"/g, '').replace(/:/, '');
      this.userName = firstName + ' ' + lastName;
    }
  }

  private showDetails() {
    this.viewDetails = true;
  }

  private hideDetails() {
    this.viewDetails = false;
  }

  get initials(): string {
    if (!this.fullName) {
        return null;
    }
    const chunks = this.fullName.split(' ');
    if (!chunks) {
        return this.fullName.substr(0, 1).toUpperCase();
    }
    return chunks.map(c => {
        return c.substr(0, 1).toUpperCase();
    }).join('');
  }

  articleAnUser(activity: any) {
    return activity.event === 'RemoveUserMutation';
  }

  articleTheUser(acitivty: any) {
    return acitivty.event !== 'RemoveUserMutation';
  }

  articleAnRole(activity: any) {
    return activity.event === 'RemoveRoleMutation';
  }

  articleTheRole(activity: any) {
    return activity.event !== 'RemoveRoleMutation';
  }

  get isActivityTypeTarget(): boolean {
    return this.type === EnumActivityType.TARGET;
  }

  get isActivityTypeUser(): boolean {
    return this.type === EnumActivityType.USER;
  }

  get isActivityTypeRole(): boolean {
    return this.type === EnumActivityType.ROLE;
  }

  get isActivityActionCreated(): boolean {
    return this.action === EnumActivityAction.CREATE;
  }

  get isActivityActionModified(): boolean {
    return this.action === EnumActivityAction.MODIFIED;
  }

  get isActivityActionDeleted(): boolean {
    return this.action === EnumActivityAction.DELETED;
  }

  get showUserOrRoleName(): boolean {
    return this.isActivityActionCreated || this.isActivityActionModified;
  }

  get isTargetDateValid(): boolean {
    return moment(this.targetDate, 'MMM').isValid();
  }

  get showCreatedTargetActivity(): boolean {
    return this.isActivityActionCreated && this.isTargetDateValid;
  }

  get isCreatedTarget(): boolean {
    return this.isActivityTypeTarget && this.showCreatedTargetActivity && this.isActivityActionCreated;
  }

  get isTargetModfiedOrDelete(): boolean {
    return this.isActivityTypeTarget && !this.isActivityActionCreated;
  }

}
