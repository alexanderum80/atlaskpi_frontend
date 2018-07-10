import { objectWithoutProperties } from '../../shared/helpers/object.helpers';
import { IUserInfo } from '../../shared/models/user';
import {ModalComponent, MenuItem} from '../../ng-material-components';
import {CommonService} from '../../shared/services/index';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormArray } from '@angular/forms';
import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Apollo } from 'apollo-angular';
import { ApolloQueryResult } from 'apollo-client/core/types';
import { Observable } from 'rxjs/Observable';
import { IWidget } from '../shared/models/widget.models';
import { clone, isEmpty } from 'lodash';
import { Subscription } from 'rxjs/Subscription';
import SweetAlert from 'sweetalert2';
import {WidgetAlertFormComponent} from '../widget-alert-form/widget-alert-form.component';
import {IAlert} from '../widget-alert-form/widget-alert-form.viewmodel';
import {widgetsGraphqlActions} from '../shared/graphql/widgets.graphql-actions';

const createAlertMutationGql = require('./create-alert.mutation.gql');
const updateAlertMutationGql = require('./update-alert.mutation.gql');
const alertByWidgetIdQueryGql = require('./alert-by-widget-id.query.gql');
const allUsersQueryGql = require('./all-users.query.gql');
const updateAlertActiveGql = require('./update-alert-active.mutation.gql');
const removeAlertGql = require('./remove-alert.mutation.gql');

@Component({
  selector: 'kpi-widget-alert',
  templateUrl: './widget-alert.component.pug',
  styleUrls: ['./widget-alert.component.scss']
})
export class WidgetAlertComponent implements OnInit, OnDestroy {
  alertForm: WidgetAlertFormComponent;

  @ViewChild('alertForm') set widgetAlertForm(content: WidgetAlertFormComponent) {
    if (content) {
      this.alertForm = content;
    }
  }
  @ViewChild('modal') modal: ModalComponent;

  backdrop = 'true';

  widget: IWidget;
  widgetName: string;
  noWidgetName = 'Widget Alert';

  alerts: IAlert[];
  users: IUserInfo[];

  showAlertForm = false;
  showAlertList = false;
  showNoAlert = true;

  isEdit = false;

  private _subscription: Subscription[] = [];

  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    private _apollo: Apollo,
    private _cdr: ChangeDetectorRef) {
      this._getUsers();
  }

  ngOnInit() {}

  ngOnDestroy() {
    CommonService.unsubscribe(this._subscription);
  }

  save(): void {
    // not allowing push notifications for chart widget for now
    if (this.isWidgetChart && this.isAlertPushNotification) {
      SweetAlert({
        type: 'info',
        title: 'Widget Alerts',
        text: 'You cannot have push notification for chart widgets'
      });
      return;
    }

    const usersWithoutTimezone = this._checkUserTimezone(this.users);
    if (usersWithoutTimezone.length) {
      SweetAlert({
        text: `Please add timezone for ${usersWithoutTimezone.join(', ')}`,
        type: 'warning',
      }).then(item => {
        if (item.value === true) {
          this.saveAlert();
        }
      });
      return;
    } else {
      this.saveAlert();
    }
  }

  saveAlert(): void {
    if (this.isEdit && this.alertForm.editId) {
      this._updateAlert();
    } else {
      this._createAlert();
    }
  }

  alertActions(item: any): void {
    switch (item.id) {
      case 'cancel':
        this.cancel();
        break;
      case 'add':
        this.add();
        break;
      case 'edit':
        this.isEdit = true;
        this.edit(item.alertId);
        break;
      case 'delete':
        this.delete(item.alertId);
        break;
      case 'disable':
        this.updateActiveField(item.alertId, false);
        break;
      case 'activate':
        this.updateActiveField(item.alertId, true);
    }

    if (item.id !== 'edit') {
      this.isEdit = false;
    }
  }

  cancel(): void {
    this.modal.close();
  }

  add(): void {
    this.enableAlertForm();

    const that = this;
    setTimeout(() => {
      if (that.alertForm) {
        that.alertForm.update({} as any);
      }
    }, 100);
  }

  edit(id: string): void {
    if (this.alerts) {
      this.enableAlertForm();
      const alert = this._getAlert(id);

      const that = this;
      setTimeout(() => {
        if (that.alertForm) {
          that.alertForm.update(alert);
          that.alertForm.setEditId(alert._id);
        }
      }, 100);
    }
  }

  enableAlertForm(): void {
    this.showNoAlert = false;
    this.showAlertList = false;
    this.showAlertForm = true;
    this._cdr.detectChanges();
  }

  delete(id: string): void {
    if (!id) { return; }
    const alert = this._getAlert(id);
    if (!alert) {
      return;
    }

    const that = this;

    SweetAlert({
        title: 'Are you sure?',
        text: 'Once deleted, you will not be able to recover this alert',
        type: 'warning',
        showConfirmButton: true,
        showCancelButton: true
    }).then(item => {
      if (item.value === true) {
        that._subscription.push(
            that._apollo.mutate({
            mutation: removeAlertGql,
            variables: {
              id: alert._id
            },
            refetchQueries: ['AlertByWidgetId']
          }).subscribe(({ data }) => {})
        );
      }
    });


  }

  updateActiveField(id: string, active: boolean): void {
    let alert = this._getAlert(id);
    if (!alert) {
      return;
    }

    alert = objectWithoutProperties(alert, ['__typename']) as any;
    alert.active = active;
    this._updateAlertActiveField(alert);
  }



  open(widget: IWidget): void {
    this.widget = widget;
    this._processWidget(widget);
  }

  get valid(): boolean {
    return this.alertForm && this.alertForm.vm.isFormValid;
  }

  get payload(): IAlert {
    const data: IAlert = this.alertForm.vm.payload;

    data.modelAlert = {
      name: 'widgets',
      id: this.widget._id
    };

    return data;
  }

  get isWidgetChart(): boolean {
    return this.widget.type === 'chart';
  }

  get isAlertPushNotification(): boolean {
    return this.payload.pushNotification ? true : false;
  }

  get activeFg() {
    return this.alertForm ? this.alertForm.vm.fg : new FormGroup({}) as any;
  }

  get showWidgetName(): boolean {
    return this.showAlertForm || this.showAlertList;
  }

  get showSimpleCloseBtn(): boolean {
    return this.showAlertList || this.showNoAlert;
  }

  private _processWidget(widget: IWidget): void {
    if (widget) {
      this.widgetName = widget.name ? widget.name : this.noWidgetName;
      this._getAlertByWidgetId(widget._id);
    }
  }

  private _getUsers(): void {
    const that = this;

    this._subscription.push(
      this._apollo.watchQuery({
        query: allUsersQueryGql,
        fetchPolicy: 'network-only'
      })
      .valueChanges
      .subscribe(({ data }: any) => {
        that.users = data.allUsers;
      })
    );
  }

  private _updateAlertActiveField(alert: IAlert): void {
    this._apollo.mutate({
      mutation: updateAlertActiveGql,
      variables: {
        id: alert._id,
        active: alert.active
      },
      refetchQueries: ['WidgetsList']
    }).subscribe(({ data }: any) => {});
  }


  private _getAlertByWidgetId(id: string): void {
    const that = this;

    this._subscription.push(this._apollo.watchQuery({
      query: alertByWidgetIdQueryGql,
      fetchPolicy: 'network-only',
      variables: {
        id: id
      }
    })
    .valueChanges
    .debounceTime(200)
    .subscribe(({ data }: any) => {
      that.showAlertForm = false;
      if (!(that.modal as any).visible) {
        that.modal.open();
      }

      if (!data || !data.alertByWidgetId) {
        return;
      }

      that.alerts = data.alertByWidgetId;

      that.showAlertList = (that.alerts && that.alerts.length) ? true : false;
      that.showNoAlert = !that.showAlertList;
    }));
  }

  private _createAlert(): void {
    const that = this;

    this._subscription.push(this._apollo.mutate({
      mutation: createAlertMutationGql,
      variables: {
        input: this.payload
      },
      refetchQueries: ['AlertByWidgetId']
    }).subscribe(({ data }: any) => {
      const result = data.createAlert;

      if (result.success) {
        that.modal.close();
      }
    }));
  }

  private _updateAlert(): void {
    const that = this;

    this._subscription.push(this._apollo.mutate({
      mutation: updateAlertMutationGql,
      variables: {
        id: that.alertForm.editId,
        input: this.payload
      },
      refetchQueries: ['AlertByWidgetId']
    })
    .subscribe(({ data }: any) => {
      const result = data.updateAlert;

      if (result.success) {
        that.modal.close();
      }
    }));
  }

  private _getAlert(id: string): IAlert {
    const alert = this.alerts.find(a => a._id === id);
    return alert;
  }

  private _checkUserTimezone(users: IUserInfo[]): string[] {
    const notifyUsers: any[] = this.payload.notifyUsers;

    const usersWithoutTimezone = [];
    users.forEach(user => {
      if (notifyUsers.indexOf(user._id) !== -1) {
        if (!user.profile || !user.profile.timezone) {
          usersWithoutTimezone.push(user.username);
        }
      }
    });

    return usersWithoutTimezone;
  }

}
