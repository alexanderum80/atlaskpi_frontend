import { IUserInfo } from './../shared/models/user';
import { IAlerts } from './alerts.model';
import { Injectable } from '@angular/core';
import { SelectionItem } from '../ng-material-components';
import { IItemListActivityName } from '../shared/interfaces/item-list-activity-names.interface';
import { CreateAlertActivity } from '../shared/authorization/activities/alerts/create-alert.activity';
import { ViewAlertActivity } from '../shared/authorization/activities/alerts/view-alert.activity';
import { UpdateAlertActivity } from '../shared/authorization/activities/alerts/update-alert.activity';
import { DeleteAlertActivity } from '../shared/authorization/activities/alerts/delete-alert.activity';
import { UserService } from '../shared/services';
import * as moment from 'moment';

@Injectable()
export class AlertsFormService {

    private _systemAlert: IAlerts;

    public alerts: IAlerts[] = [];

    private _kpiList: SelectionItem[];

    private _userList: SelectionItem[];

    private _frequencyList: SelectionItem[];

    private _conditionList: SelectionItem[];

    private _selectedAlertIndex: number;

    private _actionActivityNames: IItemListActivityName = {};

    private _currentUser: IUserInfo;

    constructor(private _userSvc: UserService
        ) {

        this._systemAlert = {
            _id: '1',
            name: 'First Sale of day',
            kpi: ' ',
            frequency: 'daily',
            condition: 'above',
            value: 0,
            active: false,
            users: [{
                identifier: '',
                deliveryMethods: []
            }],
            createdBy: '',
            createdAt: moment().toDate()
        };

        this._frequencyList = [
            { id: 'daily', title: 'Daily', selected: false },
            { id: 'weekly', title: 'Weekly', selected: false },
            { id: 'bi-weekly', title: 'Biweekly', selected: false },
            { id: 'monthly', title: 'Monthly', selected: false },
            { id: 'quarterly', title: 'Quarterly', selected: false },
            { id: 'yearly', title: 'Yearly', selected: false },
        ];

        this._conditionList = [
            {id: 'above', title: 'Is above', selected: false},
            {id: 'below', title: 'Is below', selected: false},
            {id: 'equal', title: 'Is equal', selected: false},
        ];

        this._actionActivityNames = {
            view: ViewAlertActivity.name,
            add: CreateAlertActivity.name,
            update: UpdateAlertActivity.name,
            delete: DeleteAlertActivity.name
          };
    }

    viewAlertPermission() {
        return this._userSvc.hasPermission('View', 'Alert');
    }

    createAlertPermission() {
        return this._userSvc.hasPermission('Create', 'Alert');
    }

    updateAlertPermission() {
        return this._userSvc.hasPermission('Update', 'Alert');
    }

    deleteAlertPermission() {
        return this._userSvc.hasPermission('Delete', 'Alert');
    }

    get systemAlert() {
        return this._systemAlert;
    }

    get actionActivityNames(): IItemListActivityName {
        return this._actionActivityNames;
    }

    get frequencyList() {
        return this._frequencyList;
    }

    get conditionList() {
        return this._conditionList;
    }

    get currentUser(): IUserInfo {
        return this._currentUser;
    }

    set currentUser(item: IUserInfo) {
        this._currentUser = item;
    }

    updateKpiList(kpis) {
        this._kpiList = kpis;
    }

    get kpiList() {
        return this._kpiList;
    }

    updateUsersList(users) {
        this._userList = users;
    }

    get usersList() {
        return this._userList;
    }

    updateSelectedAlertIndex(alertIndex: number) {
        this._selectedAlertIndex = alertIndex;
    }

    get selectedAlertIndex() {
        return this._selectedAlertIndex;
    }

    removeAlert(alertId: string) {
        this.alerts = this.alerts.filter(a => a._id !== alertId);
    }

}

