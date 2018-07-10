import { CommonService } from '../../../../shared/services/common.service';
import { AfterViewInit, Component, OnInit, Input, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Apollo } from 'apollo-angular';
import { uniqBy, pick, isEmpty } from 'lodash';
import * as moment from 'moment';
import SweetAlert from 'sweetalert2';
import { MenuItem, SelectionItem } from '../../../../ng-material-components';
import { userApi } from '../graphqlActions/set-goal-actions';
import { TargetService } from '../shared/target.service';
import 'rxjs/add/observable/combineLatest';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import {
  IDatePickerConfig,
} from '../../../../ng-material-components/modules/forms/date-picker/date-picker/date-picker-config.model';
import { ITarget } from '../shared/targets.interface';
import { ApolloService } from '../../../../shared/services/apollo.service';

const notificationGql = require('graphql-tag/loader!./target-notification.query.gql');
const targetAmountGql = require('graphql-tag/loader!./target-amount.query.gql');
const targetByNameQuery = require('graphql-tag/loader!../graphql/get-target-by-name.query.gql');


interface INotificationData {
  targetName?: string;
  targetAmount?: string;
  targetMet?: string;
  targetDate?: any;
  chartId?: string;
  usersId?: string[];
  businessUnit?: string;
  notificationDate?: string;
}

@Component({
  selector: 'kpi-target-form',
  templateUrl: './target-form.component.pug',
  styleUrls: ['./target-form.component.scss']
})
export class TargetFormComponent implements AfterViewInit, OnDestroy, OnInit {

  @Input() fg: FormGroup;
  @Input() fgNotify: FormGroup;
  @Input() fgVisible: FormGroup;
  @Input() mode: string;
  @Input() nonStackList: SelectionItem[];
  @Input() stackList: SelectionItem[];
  datePickerConfig: IDatePickerConfig;

  private _subscription: Subscription[] = [];

  chartId: string;

  currentUser: any;
  checkCurrentUser: string;
  notifyStaff: MenuItem[];
  visibleStaff: MenuItem[];

  valueTypes: SelectionItem[];
  varyTypes: SelectionItem[];
  periodTypes: SelectionItem[];
  notificationDateList: SelectionItem[];
  milestoneList: SelectionItem[];

  isCollapsedTargetForm = false;
  isCollapsedNotifyTarget = true;
  isCollapsedVisibleTarget = true;

  target: any;
  sendNotificationData: INotificationData;

  constructor(
      private _targetService: TargetService,
      private _apollo: Apollo,
      private _apolloService: ApolloService, ) {
      Object.assign(this, this._targetService);
  }

  ngOnInit() {
    this.datePickerConfig = {
        showGoToCurrent: false,
        format: 'MM/DD/YYYY'
    };
}
  ngOnDestroy() {
    CommonService.unsubscribe(this._subscription);
  }

  ngAfterViewInit() {
    const that = this;
    this._subscription.push(this._targetService.chartId$.subscribe(id => {
      that.chartId = id;
    }));
    this._watchChanges();
    this._getAllUsers();
    this._selectCurrentUser();
    this._getCurrentUser();
    this._targetNotification();

    this._targetService.updateExistDuplicatedName(false);
    this._subscribeToNameChanges();

  }

  // updates edit form
  updateTargetForm(target: any): void {
    if (!target) { return; }
    this.target = target;
    this.fg.patchValue(target.form);
    this._targetService.setVisibleUser(this.fgVisible, target, this.visibleStaff);
    this._targetService.setNotifyUser(this.fgNotify, target, this.notifyStaff);
  }

  // assigned to new/edit mutation target
  getFormFields(id: any): any {
    if (!id) { return; }
    if (!this.currentUser) { return; }
    const saveFormGroup = {
      fg: this.fg.value,
      fgNotify: this.fgNotify.value,
      fgVisible: this.fgVisible.value
    };
    return this._targetService.formFields(saveFormGroup, this.currentUser.username, id);
  }

  isFixed(): boolean {
    return this.fg.value.vary === 'fixed';
  }

  showNotification(): boolean {
    return this.sendNotificationData &&
           this.fg.valid && this.fgNotify.get('notifyUsers').value &&
           this.fgNotify.get('notificationUsers').value && this._targetService.isNotifyDateValid(this.fg, this.fgNotify);
  }

  sendNotifications() {
      const that = this;
      // send id in query to send notification

      if (!this.sendNotificationData) {
        this._targetService.notificationInfo$.subscribe(data => {
          that.sendNotificationData = data;
        });
      }

      if (!this._hasEfficientData(this.sendNotificationData)) {
        SweetAlert({
          title: 'Notification Error',
          text: 'Inefficient Data',
          type: 'error'
        });
        return;
      }

      this._subscription.push(this._apollo.watchQuery({
        query: notificationGql,
        fetchPolicy: 'network-only',
        variables: {
          input: this.sendNotificationData
        }
      }).valueChanges.subscribe(({ data }) => {
        // console.log('success');
      }));
  }

  get notifyDatePastDueDate(): boolean {
    if (!this.fg.get('datepicker') || !this.fgNotify.get('notificationUsers')) {
      return false;
    }

    const notifyDate = this.fgNotify.get('notificationUsers').value;
    const dueDate = this.fg.get('datepicker').value;

    return moment(notifyDate).isAfter(dueDate);
  }

  get validDueDate(): boolean {
    if (!this._targetService.dueDate$) {
      return true;
    }

    if (!this.fg || isEmpty(this.fg.controls)) {
      return true;
    }

    return this._targetService.isTargetDueDateValid(this.fg.get('datepicker').value);
  }

  get dueDate(): string {
    return this._targetService.dueDate$;
  }

  // get all users for notification and visibilty
  private _getAllUsers(): void {
    const that = this;
    this.fg.controls['active'].setValue(true);

    this._subscription.push(this._apollo.watchQuery({
      query: userApi.all,
      fetchPolicy: 'network-only'
    })
    .valueChanges.subscribe(({data}) => {

      that.notifyStaff = (<any>data).allUsers.map((v, k) => {
        return {
          id: v._id,
          title: v.username
        };
      });
      that.visibleStaff = that.notifyStaff.slice();
    }));
  }

  private _getCurrentUser() {
      const that = this;
      this._subscription.push(this._apollo.watchQuery({
        query: userApi.current,
        fetchPolicy: 'network-only'
      }).valueChanges.subscribe(({data}) => {
        that.currentUser = (<any>data).User;
      }));
  }

  private _selectCurrentUser(): void {
    const that = this;
    setTimeout(() => {
      if (!that.visibleStaff || !(Array.isArray(that.visibleStaff))) { return; }

      that.visibleStaff.forEach(v => {
        if (that.currentUser) {
          const checkCurrentUser = that.currentUser._id === v.id;
          if (/*that.fgVisible.controls[v.id] && */checkCurrentUser) {
            that.fgVisible.controls['visibleUsers'].setValue(v.id);
          }
        }
      });
    }, 1500);
  }

  // updates Unit select-picker if changed to fixed
  private _watchChanges(): void {
    const oldValueTypes = [];
    const oldPeriodTypes = [];
    Object.assign(oldValueTypes, this.valueTypes);
    Object.assign(oldPeriodTypes, this.periodTypes);

    const varyControls = this.fg.controls['vary'];
    if (varyControls) {
      this._subscription.push(varyControls.valueChanges
        .debounceTime(100)
        .distinctUntilChanged()
        .subscribe(v => {
          if (v === 'fixed') {
            let newAmountByList = [];
            Object.assign(newAmountByList, this.valueTypes);
            newAmountByList = newAmountByList.filter((amountBy) => amountBy.id !== 'percent');
            this.valueTypes = uniqBy(newAmountByList, 'title');
          } else {
            if (v !== 'decrease') {
              oldValueTypes.forEach(valueType => valueType.selected = false);
              oldPeriodTypes.forEach(periodType => periodType.selected = false);
              this.valueTypes = oldValueTypes;
              this.periodTypes = oldPeriodTypes;
            }
          }
      }));
    }
  }

  private _targetNotification(): void {
    const that = this;
    this._subscription.push(Observable.combineLatest(
      this.fg.valueChanges,
      this.fgNotify.valueChanges
    )
    .subscribe(data => {
      const fgValues = data[0];
      const fgNotifyValues = data[1];
      let notification;

      const validNotification = fgNotifyValues.notificationUsers ?
                fgNotifyValues.notificationUsers.match(/[0-9]{2}\/[0-9]{2}\/[0-9]{4}/) : '';

      if (fgNotifyValues &&
          fgNotifyValues.notifyUsers &&
          fgNotifyValues.notificationUsers && validNotification) {
            notification = that._targetService.getNotify(fgNotifyValues);
            if (!that.sendNotificationData) {
              that.sendNotificationData = {};
            }
            that.sendNotificationData.usersId = notification.users;


            // data to query target amount
            const getTargetAmount = {
              amount: fgValues.amount,
              amountBy: fgValues.amountBy,
              period: fgValues.period,
              vary: fgValues.vary,
              datepicker: fgValues.datepicker,
              nonStackName: fgValues.nonStackName,
              stackName: fgValues.stackName,
              chart: [that.chartId],
              notificationDate: notification.notification
            };

            // check if any values in the object isn't there
            if (that._hasTargetAmountDataQuery(getTargetAmount) && getTargetAmount.chart[0]) {
              this._apollo.watchQuery({
                query: targetAmountGql,
                fetchPolicy: 'network-only',
                variables: {
                  input: getTargetAmount
                }
              }).valueChanges.subscribe(({ data }) => {
                const targetAmount = (<any>data).targetAmount.amount;
                const targetMet = (<any>data).targetAmount.met;

                that.sendNotificationData = {
                  targetName: fgValues.name,
                  targetAmount: targetAmount,
                  targetMet: targetMet,
                  targetDate: moment(fgValues.datepicker).format('MM/DD/YYYY'),
                  chartId: that.chartId,
                  usersId: notification ? notification.users : '',
                  businessUnit: fgValues.nonStackName || fgValues.stackName
                };

                that._targetService.setNotificationInfo(that.sendNotificationData);
              });

            }
          }
    }));
  }

  private _hasEfficientData(data: any): boolean {
    let flag = true;
    Object.keys(data).forEach(key => {
      if (!data || data[key] === undefined || data[key] === null) {
        flag = false;
      }
    });

    return flag;
  }

  private _hasTargetAmountDataQuery(data: any): boolean {
    const mainData = pick(data, ['amount', 'amountBy', 'period', 'vary', 'chart']);
    const flag = this._hasEfficientData(mainData);

    return flag && (data.stackName || data.nonStackName);
  }

  private _subscribeToNameChanges() {
    this.fg.controls['name'].valueChanges.subscribe(n => {
        if (n === '') {
            this.fg.controls['name'].setErrors({required: true});
        } else {
            if (this._targetService.getExistDuplicatedName() === true) {
                this._apolloService.networkQuery < ITarget > (targetByNameQuery, { name: n }).then(d => {
                    if (this._setValidation(d)) {
                      this.fg.controls['name'].setErrors({forbiddenName: true});
                    } else {
                      this.fg.controls['name'].setErrors(null);
                    }
                });
            }
        }
    });
  }

  private _setValidation(target): boolean {
    return !isEmpty(target.findTargetByName) &&
           target.findTargetByName._id &&
           target.findTargetByName._id !== (this.target ? this.target.id : 0);
  }

}
