import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { SelectionItem } from '../../../ng-material-components';
import { Apollo } from 'apollo-angular';
import { ValidateFn } from 'codelyzer/walkerFactory/walkerFn';
import { AbstractControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Injectable } from '@angular/core';

import * as moment from 'moment';
import { split, isEmpty } from 'lodash';
import {IUserInfo} from '../../../shared/models/user';

const userMilestoneNotificationMutation = require('./user-milestone-notification.mutation.gql');

@Injectable()
export class MilestoneService {

  private milestoneList: SelectionItem[] = [{
    id: 'yes', title: 'Yes', selected: true, disabled: false
  }, {
    id: 'no', title: 'No', selected: false, disabled: false
  }];

  private statusList: SelectionItem[] = [{
    id: 'Due', title: 'Due', selected: false, disabled: false
  }, {
    id: 'Completed', title: 'Completed', selected: false, disabled: false
  }, {
    id: 'Declined', title: 'Declined', selected: false, disabled: false
  }];

  private responsibleList: SelectionItem[] = [];

  private milestonesItems: string[];

  private usersList: any[];

  private target: any;
  private editMilestone: any;

  private _targetSubject: BehaviorSubject<any> = new BehaviorSubject<any>(this.target);
  private editMilestoneSubject: BehaviorSubject<any> = new BehaviorSubject<any>(this.editMilestone);

  constructor(private _apollo: Apollo) { }

  // splits the select-picker into array
  multiSelectArrayFormat(selector: string) {
    return selector ? selector.split('|') : [];
  }

  setResponsibleList(id: string, responsible: string, selected: boolean) {
    const responsibleListCheck = this.responsibleList && Array.isArray(this.responsibleList) && this.responsibleList.length;
    const itemExists = this.responsibleList.find(list => list.id === id);

    if (responsibleListCheck && itemExists) {
      return;
    }
    this.responsibleList.push({ id: id, title: responsible, selected: selected, disabled: false });
  }

  setUsersList(usersList: string[]) {
    this.usersList = usersList;
  }

  setTarget(target: any) {
    if (!target) { return; }
    this.target = target;
    this._targetSubject.next(this.target);
  }

  setEditMilestone(milestone: any) {
    if (!milestone) { return; }
    this.editMilestone = milestone;
    this.editMilestoneSubject.next(this.editMilestone);
  }

  resetResponsibleList() {
    this.responsibleList = [];
  }

  processUsersList(users: any) {
    this.setUsersList(users);
    this.usersList.forEach(item => {
      const responsible = this._fullName(item);
      this.setResponsibleList(item._id, responsible, false);
    });

    return this.responsibleList ? this.responsibleList : null;
  }

  getUsersList() {
    return this.usersList;
  }

  getStatusList() {
    return this.statusList;
  }

  validDateFormat(date: string) {
    return moment(date).isValid();
  }

  userMilestoneNotification(responsible: any, options: { task: string, dueDate: string}) {
    split(responsible, '|').map((r) => {
      const users = this.getUsersList().filter(val => val._id === r);

      if (users) {
        this._apollo.mutate({
          mutation: userMilestoneNotificationMutation,
          variables: {
            input: {
              email: users[0].username,
              dueDate: options.dueDate,
              task: options.task,
              fullName: this._fullName(users[0])
            }
          }
        })
        .toPromise()
        .then(({data}) => {
        });
      }
    });
  }

  getVisible(data: any) {
    const arr = [];
    for (const i in data) {
      if (data[i] === true) {
        arr.push(i);
      }
    }
    return arr;
  }

  get targets$(): Observable<any[]> {
    return this._targetSubject.asObservable();
  }

  get editMilestone$(): Observable<any> {
    return this.editMilestoneSubject.asObservable().distinctUntilChanged();
  }

  get milestoneImage() {
    return '../../../../assets/img/milestone.jpg';
  }

  private _fullName(user: IUserInfo): string {
    let name = '';
    if (isEmpty(user)) {
      return name;
    }

    if (!isEmpty(user.profile) && user.profile.firstName) {
      name = `${user.profile.firstName} ${user.profile.lastName}`;
    }

    return name;
  }

}
