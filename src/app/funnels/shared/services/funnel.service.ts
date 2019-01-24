import { Injectable } from '@angular/core';

import { Apollo } from 'apollo-angular';
import { filter, map, tap, catchError } from 'rxjs/operators';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { SelectionItem, guid } from '../../../ng-material-components';
import { ToSelectionItemList } from '../../../shared/extentions';
import { FormGroupTypeSafe } from '../../../shared/services';
import { IFunnel, IFunnelStage, IFunnelStageOptions } from '../models/funnel.model';
import { IKpiDateRangePickerDateRange } from '../models/models';
import { ApolloService } from '../../../shared/services/apollo.service';
import { isEmpty } from 'lodash';
import { IChartDateRange } from '../../../shared/models';
import * as moment from 'moment';
import { IRenderedFunnel, IRenderedFunnelStage } from '../models/rendered-funnel.model';


const sampleFunnel: IRenderedFunnel = {
    _id: '1',
    name: 'Inquires to Surgery Pipeline',
    stages: [
      {
        _id: '1',
        order: 1,
        name: 'Inquires',
        count: 100,
        amount: 1000000,
        foreground: '#fff',
        background: '#FF3D00',
      },
      {
        _id: '2',
        order: 2,
        name: 'Scheduled Consults',
        count: 60,
        amount: 350000,
        foreground: '#fff',
        background: '#FF6F00',
      },
      {
        _id: '3',
        order: 3,
        name: 'Completed Consults',
        count: 50,
        amount: 320000,
        foreground: '#fff',
        background: '#FFC107',
      },
      {
        _id: '4',
        order: 4,
        name: 'Scheduled Surgeries',
        count: 33,
        amount: 320000,
        foreground: '#fff',
        background: '#4CAF50',
        compareToStageName: 'Completed Consults',
        compareToStageValue: 65
      },
      {
        _id: '5',
        order: 5,
        name: 'Completed Surgeries',
        count: 30,
        amount: 192000,
        foreground: '#fff',
        background: '#304FFE',
        compareToStageName: 'Completed Consults',
        compareToStageValue: 60
      },
    ]
  };

const kpiIdNameList = require('graphql-tag/loader!../graphql/kpi-list.query.gql');

// TODO: Implement a getAvailableFieldsQuery in the backed.
// now using KPIGroupings for testing purposes
const kpiGroupingsQuery = require('graphql-tag/loader!./kpi-groupings.query.gql');

@Injectable()
export class FunnelService {
    private _funnelModel: IFunnel;
    set funnelModel(value: IFunnel) {
        this._funnelModel = value;
        this._tryToRender(value);
    }
    get funnelModel(): IFunnel { return this._funnelModel; }

    private _fg: FormGroupTypeSafe<IFunnel>;
    get fg(): FormGroupTypeSafe<IFunnel> {
        return this._fg;
    }

    kpiSelectionList: SelectionItem[] = [];

    stagesSelectionList$ = new BehaviorSubject<SelectionItem[]>([]);

    private _renderedFunnelModel: IRenderedFunnel = {
        name: 'Sample Funnel',
        stages: []
    };

    renderedFunnelModel$ = new BehaviorSubject<IRenderedFunnel>(null);

    constructor(
        private apollo: Apollo,
        private _apolloService: ApolloService,
    ) { }

    loadDependencies$(): Observable<boolean> {
       return this.apollo.query<{ kpis: { _id: string, name: string }[] }>({
                query: kpiIdNameList,
                fetchPolicy: 'network-only',
            })
         .pipe(
            tap(_ => {
                this.kpiSelectionList = ToSelectionItemList(_.data.kpis, '_id', 'name');
            }),
            catchError(error => {
                console.log(error);
                return throwError(error);
            }),
            map(_ => true)
        );
    }

    getCompareToStageListForStage(stage: IFunnelStage): SelectionItem[] {
        const stageIndex = this._funnelModel.stages.findIndex(s => s === stage);

        if (stageIndex  === 0) { return []; }

        const stages = this._funnelModel.stages.filter(s => s !== stage);

        return ToSelectionItemList(stages, 'id', 'id');
    }

    // TODO: Implement a getAvailableFieldsQuery in the backed.
    // now using KPIGroupings for testing purposes
    async getAvailableFields(kpi: string, dateRange: IKpiDateRangePickerDateRange ): Promise<SelectionItem[]> {
        if (!kpi || !dateRange) { return []; }


        if (!dateRange.predefinedDateRange) { return []; }

        // incomplete custom dateRange
        if (dateRange.predefinedDateRange === 'custom'
             && (!dateRange.from || !dateRange.to)) {
             return [];
        }


        const input = this._getGroupingInfoInput(kpi, dateRange);

        const data = await this._apolloService.networkQuery(kpiGroupingsQuery, { input });

        return ToSelectionItemList(data.kpiGroupings, 'value', 'name');
    }

    addStage() {
        const newStage: IFunnelStage = {
            _id: guid(),
            order: this._funnelModel.stages.length,
            name: 'New Stage',
            kpi: null,
            dateRange: null,
            foreground: '#fff',
            background: '#7cb5ec'
        };

        this._funnelModel.stages.push(newStage);

        this._emitStagesList();
    }

    removeStage(stage: IFunnelStage) {
        this._funnelModel.stages = this.funnelModel.stages.filter(s => s !== stage);
        this._emitStagesList();
    }

    updateFunnelName(name: string) {
        if (!this._renderedFunnelModel) { return; }

        this._renderedFunnelModel.name = name;
        this.renderedFunnelModel$.next(this._renderedFunnelModel);
    }

    updateStage(stage: IFunnelStage, props: IFunnelStageOptions) {
        const { name } = props;
        const foundDataModelStage = this._funnelModel.stages.find(s => s === stage);

        if (!foundDataModelStage) {
            console.log('funnel stage not found');
            return;
        }

        foundDataModelStage.name = name;

        this._emitStagesList();

        // preview

        if (!this._renderedFunnelModel) { return; }

        const foundPreviewModelStage = this._renderedFunnelModel.stages.find(s => s._id === stage._id);

        if (!foundPreviewModelStage) {
            console.log('funnel preview stage not found');
            return;
        }

        foundPreviewModelStage.name = name;

        this.renderedFunnelModel$.next(this._renderedFunnelModel);
    }

    renderFunnel(value: IFunnel) {
        const { name, stages } = value;

        const mockStages: IRenderedFunnelStage[]  = [];

        if (!value.stages || !value.stages.length) { return { name, stages: []} as IRenderedFunnel; }

        // this method should go to the server
        // mockig the data for now

        value.stages.forEach((stage, index) => {
            const { compareToStage, foreground, background } = stage;
            const stageName = stage.name;

            const newStage: IRenderedFunnelStage = {
                foreground,
                background,
                name: stageName,
                compareToStageName: compareToStage,
                amount: sampleFunnel.stages[index].amount,
                count: sampleFunnel.stages[index].count,
                order: index
            };

            mockStages.push(newStage);
        });

        const rendered: IRenderedFunnel = {
            name,
            stages: mockStages
        };

        this._renderedFunnelModel = rendered;
        this.renderedFunnelModel$.next(this._renderedFunnelModel);
    }

    performFunnelInvalidFlow() {
        this._renderedFunnelModel = null;
        this.renderedFunnelModel$.next(this._renderedFunnelModel);
    }

    private _emitStagesList() {
        const stagesSelectionList
        = ToSelectionItemList(this._funnelModel.stages, '_id', 'name');

        this.stagesSelectionList$.next(stagesSelectionList);
    }

    private _getGroupingInfoInput(kpi: string, dateRange: IKpiDateRangePickerDateRange): { id: string, dateRange: IChartDateRange[] } {
        const dr = { predefined: dateRange.predefinedDateRange, custom: null};

        // process custom dateRange
        if (dateRange.from && dateRange.to) {
            dr.custom = {
                from: moment(dateRange.from).format('MM/DD/YYYY'),
                to: moment(dateRange.to).format('MM/DD/YYYY')
            };
        }

        return {
            id: kpi,
            dateRange: [dr]
        };
    }

    private _tryToRender(value: IFunnel) {
        if (!value) { return; }

        const { name = '', stages = [] } = value;

        this._renderedFunnelModel = this._renderedFunnelModel || { name: '', stages: []};

        this._renderedFunnelModel.name = name;

        this.renderedFunnelModel$.next(this._renderedFunnelModel);
    }

}
