import { BrowserService } from './../shared/services/browser.service';
import SweetAlert from 'sweetalert2';
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { IAlerts, DeliveryMethodEnum } from './alerts.model';
import { AlertsFormService } from './alerts.service';
import { ApolloService } from '../shared/services/apollo.service';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { UserService } from '../shared/services/user.service';
import { Router } from '@angular/router';
import * as moment from 'moment';

const alertsQuery = require('graphql-tag/loader!./alerts.query.gql');
const addAlertMutation = require('graphql-tag/loader!./create-alert.mutation.gql');
const updateAlertMutation = require('graphql-tag/loader!./update-alert.mutation.gql');
const updateAlertActiveMutation = require('graphql-tag/loader!./update-alert-active.mutation.gql');

const ViewsMap = {
  Summary: 'summary',
  Details: 'details'
};

@Component({
  selector: 'app-alerts',
  templateUrl: './alerts.component.pug',
  styleUrls: ['./alerts.component.scss'],
  providers: [AlertsFormService]
})
export class AlertsComponent implements OnInit, AfterViewInit {

  isLoading = true;
  isMobile: boolean;

  flipped = false;
  private _activeView = ViewsMap.Summary;

  fgDetails: FormGroup = new FormGroup({
    '_id': new FormControl(''),
    'name': new FormControl('', Validators.required),
    'kpi': new FormControl('', Validators.required),
    'frequency': new FormControl('', Validators.required),
    'condition': new FormControl('', Validators.required),
    'value': new FormControl('', Validators.required),
    'users': new FormArray([], Validators.required)
  });

  constructor(
    public vm: AlertsFormService,
    private _apolloService: ApolloService,
    private _browser: BrowserService,
    private _userSvc: UserService,
    private _router: Router,
  ) {
    this.isMobile = this._browser.isMobile();
  }

  async ngOnInit() {
    if (!this.vm.viewAlertPermission()) {
      this._router.navigateByUrl('/unauthorized');
    }
    this.getCurrentUser();
    await this._getAlerts();
    this._subscribeToFormChange();
    this.isLoading = false;
    this.flipped = false;
  }

  ngAfterViewInit() {
  }

  getCurrentUser() {
    this._userSvc.user$.subscribe(user => {
      if (user) {
        this.vm.currentUser = user;
        this.vm.systemAlert.users[0].identifier = this.vm.currentUser._id;
        this.vm.systemAlert.users[0].deliveryMethods.push('push');
      }
    });
  }

  get selectedAlert() {
    return this.vm.alerts[this.vm.selectedAlertIndex];
  }

  get canAddAlert() {
    return this.vm.alerts && this.vm.alerts[0]
    && this.vm.alerts[0]._id !== this.vm.systemAlert._id
    && this.vm.alerts[this.vm.alerts.length - 1]._id;
  }

  private _subscribeToFormChange() {
    this.fgDetails.valueChanges.subscribe(fg => {
      this.vm.alerts[this.vm.selectedAlertIndex].name = fg.name || null;
      this.vm.alerts[this.vm.selectedAlertIndex].frequency = fg.frequency || null;
      if (fg.value) {
        if (isNaN(fg.value)) {
          this.fgDetails.controls['value'].setErrors({ invalidValue: true });
        } else {
          this.fgDetails.controls['value'].setErrors(null);
        }
      }
    });
  }

  private async _getAlerts() {
    this.vm.alerts = [];
    await this._apolloService.networkQuery < any[] > (alertsQuery).then(data => {
      const specialAlert = data.alerts.find(a => a.name === 'First Sale of day');
      if (!specialAlert) {
        this.vm.alerts.push(this.vm.systemAlert);
      }
      data.alerts.forEach(element => {
          this.vm.alerts.push({
            _id: element._id,
            name: element.name,
            kpi: element.kpi,
            frequency: element.frequency,
            condition: element.condition,
            value: element.value,
            active: element.active,
            users: element.users,
            createdBy: element.createdBy,
            createdAt: element.createdAt
          });
      });
      this.updateSelectedAlertIndex(0);
    });
  }

  isFormValid() {
    if (!this.vm.alerts[this.vm.selectedAlertIndex]) {
      return false;
    }
    if (this.vm.alerts[this.vm.selectedAlertIndex].name === this.vm.systemAlert.name) {
      return this.fgDetails.controls['kpi'].valid;
    } else {
      return this.fgDetails.valid;
    }
  }

  onAddAlert() {
    if (!this.vm.createAlertPermission()) {
      this._router.navigateByUrl('/unauthorized');
   } else {
      this.vm.alerts.push({
        name: '',
        kpi: ' ',
        frequency: null,
        condition: null,
        value: undefined,
        active: true,
        users: [{
            identifier: this.vm.currentUser._id,
            deliveryMethods: [DeliveryMethodEnum.push],
        }],
        createdBy: '',
        createdAt: moment().toDate()
      });
      const lastAlertIndex = this.vm.alerts.length - 1;
      this.updateSelectedAlertIndex(lastAlertIndex);
   }
  }

  switchActive(event: boolean, index: number) {
    if (!this.vm.updateAlertPermission()) {
      this._router.navigateByUrl('/unauthorized');
   } else {
      this.vm.alerts[index].active = event;
      if (this.vm.alerts[index]._id) {
        this._apolloService.mutation<IAlerts> (updateAlertActiveMutation, { id: this.vm.alerts[index]._id, active: event }, ['Alerts'])
          .then(() => {
          });
      }
    }
  }

  updateSelectedAlertIndex(alertIndex) {
    this.vm.updateSelectedAlertIndex(alertIndex);
    const fgValue = {
      _id: this.selectedAlert._id || null,
      name: this.selectedAlert.name,
      kpi: this.selectedAlert.kpi || null,
      frequency: this.selectedAlert.frequency,
      condition: this.selectedAlert.condition,
      value: this.selectedAlert.value,
    };
    this.fgDetails.patchValue(fgValue);
    this.flipped = true;
  }

  backToListClicked() {
    this.flipped = false;
  }

  toggle(view) {
      if (this._activeView === view) {
          return;
      }

      if (view === ViewsMap.Summary) {
          this._switchView(ViewsMap.Summary, ViewsMap.Details);
      } else {
          this._switchView(ViewsMap.Details, ViewsMap.Summary);
      }

  }

  private _switchView(frontView, backView) {
      const that = this;
      const suffix = 'Position';

      this._activeView = frontView;

      that[backView + suffix] = 'behind';

      setTimeout(() => {
          that[frontView + suffix] = 'front';
          that[backView + suffix] = 'back';
      }, 350);
  }

  save(systemAlert?: any) {
    if (!this.vm.updateAlertPermission()) {
      this._router.navigateByUrl('/unauthorized');
    } else {
      let payload;
      if (systemAlert) {
        payload = systemAlert;
        payload['_id'] = undefined;
      } else {
        const userNotification = [];
        this.fgDetails.value.users.map(userItem => {
          const arrayUsers = userItem.user.split('|');
          arrayUsers.map( au => {
            userNotification.push({
              identifier: au,
              deliveryMethods: (!userItem.byEmail && !userItem.byPhone) ? []
              : (userItem.byEmail && !userItem.byPhone) ? ['email']
              : (!userItem.byEmail && userItem.byPhone) ? ['push'] : ['email', 'push']
            });
          });
        });
        payload = {
          _id: this.fgDetails.value._id,
          name: this.fgDetails.value.name,
          kpi: this.fgDetails.value.kpi,
          frequency: this.fgDetails.value.frequency,
          condition: this.fgDetails.value.condition,
          value: parseFloat(this.fgDetails.value.value),
          active: this.vm.alerts[this.vm.selectedAlertIndex].active,
          users: userNotification,
          createdBy: this.vm.currentUser._id,
          createdAt: moment().toDate()
        };
      }
      const mutation = (payload._id && payload._id !== '1')  ? updateAlertMutation : addAlertMutation;
      const inputVar = {
        input: {
          name: payload.name,
          kpi: payload.kpi,
          frequency: payload.frequency,
          condition: payload.condition,
          value: payload.value,
          active: payload.active,
          users: payload.users,
          createdBy: payload.createdBy,
          createdAt: payload.createdAt
        }
      };
      const isAdding = payload._id && payload._id !== '1'  ? false : true;
      if (!isAdding) {
        inputVar['id'] = payload._id;
      }

      this._apolloService.mutation<IAlerts> (mutation, inputVar, ['Alerts'])
        .then(res => {
          let resultSuccess = false;
          if (isAdding) {
            resultSuccess = res.data.createAlert.success;
          } else {
            resultSuccess = res.data.updateAlert.success;
          }
          if (resultSuccess && !systemAlert) {
            SweetAlert({
              type: 'info',
              title: 'All changes have been saved successfully',
              showConfirmButton: true,
              confirmButtonText: 'OK'});
          }
          this._getAlerts();
        });
    }
  }

  async cancel() {
    this.isLoading = true;
    await this._getAlerts();
    this.updateSelectedAlertIndex(0);
    this.isLoading = false;
    this.flipped = false;
  }
}
