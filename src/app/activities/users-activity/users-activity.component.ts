import { ApolloService } from '../../shared/services/apollo.service';
import { Component, Input, OnInit } from '@angular/core';
import { IUsersActivity } from '../shared/models/activity-models';
import { ITarget } from '../../charts/chart-view/set-goal/shared/targets.interface';
import * as moment from 'moment';
import { isEmpty, isNumber, pick } from 'lodash';

const targetById = require('graphql-tag/loader!../shared/querys/target-by-id.gql');
const targetAmountQuery = require('graphql-tag/loader!./target-amount.query.gql');

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

    // if (this.type === 'Target') {
    //   if (this.action === 'created') {
    //     data = data[2].split(',');
    //     data = data[0].split(':');
    //     const targetName = data[1].replace(/"/g, '');

    //     if (this.activity && this.activity.payload) {
    //       const targetPayload: string = this.activity.payload;

    //       if (typeof targetPayload === 'string') {
    //         const parsedPayload = JSON.parse(targetPayload);
    //         this.processCreateTarget(parsedPayload);
    //       }
    //     }
    //   }
    //   if (this.action === 'modified') {
    //     data = data[1].split(',');
    //     data = data[0].split(':');
    //     const targetId = data[1].replace(/"/g, '');

    //     this.getTargetById(targetId);
    //   }
    //   if (this.action === 'deleted') {
    //     data = data[data.length - 1].split(',');
    //     data = data[0].split(':');
    //     const targetId = data[1].replace(/"/g, '');

    //     this.getTargetById(targetId);
    //   }
    // }

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

  getTargetById(id: string) {
    const that = this;

    this._apolloService.networkQuery < ITarget > (targetById, { id: id })
    .then(target => {
        if (isEmpty(target.findTargetByName)) {
          return;
        }

        if (target.findTargetById._id !== '') {
        that.updateTargetData(target.findTargetById);
      }
    });
  }

  processCreateTarget(payload: any) {
    if (isEmpty(payload) || !payload.variables || !payload.variables.data) {
      return;
    }

    const that = this;
    const data = payload.variables.data;
    const input = pick(
      data,
      [
        'amount', 'amountBy', 'datepicker', 'period',
        'vary', 'nonStackName', 'stackName', 'chart'
      ]
    );

    this._apolloService.networkQuery(targetAmountQuery, { input: input})
      .then(response => {
        const responseAmount: number = (response && !isEmpty(response.targetAmount)) ? response.targetAmount.amount : 0;
        const targetAmount: number = isNumber(data.target) ? data.target : responseAmount;
        data.target = targetAmount;

        that.updateTargetData(data);
      });
  }

  updateTargetData(target: ITarget) {
    const that = this;

    that.targetName = target.name;
    that.targetDate = moment(target.datepicker).toDate();
    that.targetAmount = target.target;
    that.targetStackName = target.nonStackName || target.stackName;
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
