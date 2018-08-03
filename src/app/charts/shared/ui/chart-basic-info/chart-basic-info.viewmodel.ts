import { SelectionItem } from './../../../../ng-material-components/models/selection-item';
import { Apollo } from 'apollo-angular';
import { ViewModel } from '../../../../ng-material-components/viewModels/view-model';
import { IUserInfo } from '../../../../shared/models/index';
import { UserService } from '../../../../shared/services/user.service';
import { Injectable } from '@angular/core';
import introJs from 'intro.js/intro.js';

const userPreferenceMutationGql = require('graphql-tag/loader!./update-user-preference.mutation.gql');

@Injectable()
export class ChartBasicInfoViewModel extends ViewModel<any> {
    steps = [{
        element: '#element',
        intro: 'Welcome to the chart creation screen. Follow this short tutorial of how to create charts. Click start to begin.',
        position: 'top'
    }, {
        element: '#select-kpi',
        intro: 'Select a KPI, this will be yhe primary source of data of your chart. (E.g \'Sales\', \'Expenses\')',
        position: 'bottom'
    }, {
        element: '#select-chart-type',
        intro: `Select the chart type you want to use when you data is displayed`,
        position: 'bottom'
    }, {
        element: '#select-date-range',
        intro: 'Enter a date range (E.g \'Last Year\', \'all times\')',
        position: 'bottom'
    }, {
        element: '#select-frequency',
        intro: `Select a frequency (E.g \'Monthly\', \'daily\').
            Note that pie charts don\'t suport frecuency, so that\'s why is disabled`,
        position: 'bottom'
    }, {
        element: '#select-grouping',
        intro: `You can also separate your data using different groupping criteria
            (E.g Group your data by \'Location\', \'Product\')`,
        position: 'top'
    }, {
        element: '#select-xaxis-source',
        intro: `You can select the dimension to go on the X-axis.
            This is only available when you have specified some grouping. This is not defined for pie charts`,
        position: 'top'
    }, {
        element: '#chart-name',
        intro: `Enter a name for your chart this name will be shown in your final chart.`,
        position: 'top'
    }, {
        element: '#chart-group',
        intro: `Enter a group to identify the chart (E.g 'Revenue'). and a description (optional)`,
        position: 'top'
    }, {
        element: '#select-dashboards',
        intro: `Select a Dashboard to show your chart in.
            If no dashboard is selected you could anly see the chart from the 'Charts' link on the main page left panel.`,
        position: ''
    }, {
        element: '#start-tour',
        intro: `Last but not least you can always show this tour again by clicking here. Enjoy!`,
        position: 'bottom'
    }];

    private _introConfig: any;
    private tourVisits: number;
    private _comparisonList: SelectionItem[] = [];

    constructor(userService: UserService, private _apollo: Apollo) {
        super(userService);

         this._introConfig = introJs.introJs().setOptions({
            steps: this.steps
        });
    }

    public initialize(model: any): void {
        this.onInit(model);
    }

    startTour() {
        this._introConfig.start();
    }

    disableChartTour(): void {
        if (!this._user.preferences.chart.showTour) { return; }
        const payload = {
            chart: {
                showTour: false
            }
        };

        const that = this;

        this._apollo.mutate({
            mutation: userPreferenceMutationGql,
            variables: {
                id: this._user._id,
                input: payload
            }
        }).subscribe(({ data }) => {
            if (!data) { return; }

            const res = (<any>data).updateUserPreference;
            if (!res.success || !res.entity.preferences) { return; }

            that._user.preferences = res.entity.preferences;
        });
    }

    get showChartTour(): boolean {
        return this._user.preferences.chart.showTour;
    }

    get comparisonList() {
        return this._comparisonList;
    }
    set comparisonList(value: any) {
        this._comparisonList = value;
    }

}
