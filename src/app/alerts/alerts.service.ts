import { IAlerts } from './alerts.model';
import { Injectable } from '@angular/core';
import { SelectionItem } from '../ng-material-components';
import { IItemListActivityName } from '../shared/interfaces/item-list-activity-names.interface';
import { CreateAlertActivity } from '../shared/authorization/activities/alerts/create-alert.activity';
import { UpdateAlertActivity } from '../shared/authorization/activities/alerts/update-alert.activity';
import { DeleteAlertActivity } from '../shared/authorization/activities/alerts/delete-alert.activity';

@Injectable()
export class AlertsFormService {

    private _systemAlert: IAlerts;

    public alerts: IAlerts[] = [];

    private _kpiList: SelectionItem[];

    private _userList: SelectionItem[];

    private _frequencyList: SelectionItem[];

    private _conditionList: SelectionItem[];

    private _selectedAlertIndex: number;

    private _defaultAlertModel: IAlerts;

    private _actionActivityNames: IItemListActivityName = {};

    constructor() {

        this._systemAlert = {
            _id: '1',
            name: 'First Sale of day',
            kpi: ' ',
            frequency: 'monthly',
            condition: '',
            value: 0,
            notificationUsers: [{
                user: '',
                byEmail: false,
                byPhone: false
            }],
            active: false
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

        this._defaultAlertModel = {
            name: '',
            kpi: ' ',
            frequency: null,
            condition: null,
            value: undefined,
            notificationUsers: [{
                user: '',
                byEmail: false,
                byPhone: false
            }],
            active: true
        };

        this._actionActivityNames = {
            add: CreateAlertActivity.name,
            update: UpdateAlertActivity.name,
            delete: DeleteAlertActivity.name
          };
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

    get defaultAlertModel() {
        return this._defaultAlertModel;
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

