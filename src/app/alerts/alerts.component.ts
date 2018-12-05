import { split } from 'lodash';
import { map } from 'rxjs/operators';
import { IUser } from './../users/shared/models/user';
import { BrowserService } from './../shared/services/browser.service';
import { IItemListActivityName } from './../shared/interfaces/item-list-activity-names.interface';
import SweetAlert from 'sweetalert2';
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { IAlerts } from './alerts.model';
import { AlertsFormService } from './alerts.service';
import { ApolloService } from '../shared/services/apollo.service';
import { Activity } from '../shared/authorization/decorators/component-activity.decorator';
import { ViewAlertActivity } from '../shared/authorization/activities/alerts/view-alert.activity';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { UserService } from '../shared/services/user.service';

const alertsQuery = require('graphql-tag/loader!./alerts.query.gql');
const addAlertMutation = require('graphql-tag/loader!./create-alert.mutation.gql');
const updateAlertMutation = require('graphql-tag/loader!./update-alert.mutation.gql');
const updateAlertActiveMutation = require('graphql-tag/loader!./update-alert-active.mutation.gql');

const ViewsMap = {
  Summary: 'summary',
  Details: 'details'
};

@Activity(ViewAlertActivity)
@Component({
  selector: 'app-alerts',
  templateUrl: './alerts.component.pug',
  styleUrls: ['./alerts.component.scss'],
  providers: [AlertsFormService]
})
export class AlertsComponent implements OnInit, AfterViewInit {

  actionActivityNames: IItemListActivityName;

  isLoading = true;
  isMobile: boolean;

  flipped = false;
  private _activeView = ViewsMap.Summary;

  fgDetails: FormGroup = new FormGroup({
    '_id': new FormControl(''),
    'name': new FormControl('', Validators.required),
    'kpi': new FormControl('', Validators.required),
    'frequency': new FormControl(''),
    'condition': new FormControl(''),
    'value': new FormControl(''),
    'notificationUsers': new FormArray([])
  });

  constructor(
    public vm: AlertsFormService,
    private _apolloService: ApolloService,
    private _browser: BrowserService,
    private _userSvc: UserService
  ) {
    this.actionActivityNames = this.vm.actionActivityNames;
    this.isMobile = _browser.isMobile();
  }

  async ngOnInit() {
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
        this.vm.systemAlert.notificationUsers[0].user[0] = this.vm.currentUser._id;
      }
    });
  }

  get selectedAlert() {
    return this.vm.alerts[this.vm.selectedAlertIndex];
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
      const existSpecialAlert = data.alerts.find(a => a.name === 'First Sale of day');
      if (!existSpecialAlert) {
        this.save(this.vm.systemAlert);
      } else {
        data.alerts.forEach(element => {
          this.vm.alerts.push({
            _id: element._id,
            name: element.name,
            kpi: element.kpi,
            frequency: element.frequency,
            condition: element.condition,
            value: element.value,
            notificationUsers: element.notificationUsers,
            active: element.active
          });
        });
        this.updateSelectedAlertIndex(0);
      }
    });
  }

  isFormValid() {
    let valid = false;
    if (this.fgDetails.value._id) {
      // update
      valid = this.vm.updateAlertPermission();
    } else {
      // create
      valid = this.vm.createAlertPermission();
    }
    return this.fgDetails.valid && valid;
  }

  onAddAlert() {
    this.vm.defaultAlertModel.notificationUsers[0].user[0] = this.vm.currentUser._id;
    this.vm.defaultAlertModel.notificationUsers[0].byPhone = true;
    this.vm.alerts.push(this.vm.defaultAlertModel);
    const lastAlertIndex = this.vm.alerts.length - 1;
    this.updateSelectedAlertIndex(lastAlertIndex);
  }

  switchActive(event: boolean, index: number) {
    this.vm.alerts[index].active = event;
    if (this.vm.alerts[index]._id) {
      this._apolloService.mutation<IAlerts> (updateAlertActiveMutation, { id: this.vm.alerts[index]._id, active: event }, ['Alerts'])
        .then(() => {
        });
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
    let payload;
    if (systemAlert) {
      payload = systemAlert;
      payload['_id'] = undefined;
    } else {
      payload = {
        _id: this.fgDetails.value._id,
        name: this.fgDetails.value.name,
        kpi: this.fgDetails.value.kpi,
        frequency: this.fgDetails.value.frequency,
        condition: this.fgDetails.value.condition,
        value: parseFloat(this.fgDetails.value.value),
        active: this.vm.alerts[this.vm.selectedAlertIndex].active,
        notificationUsers: this.fgDetails.value.notificationUsers.map(n => {
          return {
            user: n.user.split('|'),
            byEmail: n.byEmail !== true ? false : true,
            byPhone: n.byPhone !== true ? false : true
          };
        })
      };
    }
    const mutation = payload._id ? updateAlertMutation : addAlertMutation;
    const inputVar = {
      input: {
        name: payload.name,
        kpi: payload.kpi,
        frequency: payload.frequency,
        condition: payload.condition,
        value: payload.value,
        notificationUsers: payload.notificationUsers,
        active: payload.active
      }
    };
    const isAdding = payload._id ? false : true;
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

  async cancel() {
    this.isLoading = true;
    await this._getAlerts();
    this.updateSelectedAlertIndex(0);
    this.isLoading = false;
    this.flipped = false;
  }
}
