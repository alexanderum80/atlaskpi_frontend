import { Injectable } from '@angular/core';
import { IResultGroup } from '../shared/models/result-groups';

const _dataTypeCollection = [
    {
        name: 'Dashboards',
        color: 'lightblue',
        icon: 'chart',
        order: 40,
        enabled: true,
        uriFormat: 'dashboards'
    },
    {
        name: 'Charts',
        color: 'lightgreen',
        icon: 'chart',
        order: 40,
        enabled: true,
        uriFormat: 'charts/edit',
    },
    {
        name: 'KPIs',
        color: 'purple',
        icon: 'collection-bookmark',
        order: 60,
        enabled: true,
        uriFormat: 'kpis/edit'
    },
    {
        name: 'Slideshows',
        color: 'yellow',
        icon: 'tv',
        order: 80,
        enabled: true,
        uriFormat: 'charts-slideshow/edit'
    },
    {
        name: 'Widgets',
        color: 'red',
        icon: 'widgets',
        order: 100,
        enabled: true,
        uriFormat: 'widgets/edit'
    },
    {
        name: 'Users',
        color: 'green',
        icon: 'account',
        order: 120,
        enabled: true,
        uriFormat: 'settings/users'
    },
    {
        name: 'Roles',
        color: 'blue',
        icon: 'accounts-alt',
        order: 140,
        enabled: true,
        uriFormat: 'settings/roles'
    },
    {
        name: 'Appointments',
        color: 'gray',
        icon: 'calendar-note',
        order: 160,
        enabled: true,
        uriFormat: ''
    },
    {
        name: 'Maps',
        color: 'deeporange',
        icon: 'google-maps',
        order: 180,
        enabled: true,
        uriFormat: ''
    }
];


@Injectable()
export class SearchResultViewModel {

    private _resultGroups: IResultGroup[];


    get resultGroups() {
        return this._resultGroups;
    }

    get dataTypeCollection() {
        return _dataTypeCollection;
    }

    updateResultGroups(groups: IResultGroup[]): void {
        if (groups !== this._resultGroups) {
            this._resultGroups = groups;
        }
    }
}
