import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { SelectionItem } from '../../../ng-material-components/index';

const Dasboard = gql`
    query Dasboard($id: String!, $dateRange: DateRange!, $frequency: String) {
        dashboard(id: $id, dateRange: $dateRange, frequency: $frequency) {
            _id
            name
            description
            charts
        }
    }
`;



@Injectable()
export class DashboardService {
    private accessTypes: SelectionItem[] = [
        {
            id: 'Can view',
            title: 'Can view'
        },
        {
            id: 'Can edit',
            title: 'Can edit'
        },
        {
            id: 'Can remove',
            title: 'Can remove'
        },
        {
            id: 'All',
            title: 'All'
        }
    ];

    constructor() { }
    private existDuplicatedName: boolean;


    get accessTypesItems() {
        return this.accessTypes;
    }

    updateExistDuplicatedName(value: boolean) {
        this.existDuplicatedName = value;
    }

    getExistDuplicatedName() {
        return this.existDuplicatedName;
    }

}
