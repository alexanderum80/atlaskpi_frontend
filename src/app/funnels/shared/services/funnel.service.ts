import { Injectable } from '@angular/core';

import { Apollo } from 'apollo-angular';
import { filter, map, tap, catchError } from 'rxjs/operators';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { SelectionItem, guid } from '../../../ng-material-components';
import { ToSelectionItemList } from '../../../shared/extentions';
import { FormGroupTypeSafe } from '../../../shared/services';
import { IFunnel, IFunnelStage } from '../models/funnel.model';
import { IKpiDateRangePickerDateRange } from '../models/models';
import { ApolloService } from '../../../shared/services/apollo.service';
import { isEmpty } from 'lodash';
import { IChartDateRange } from '../../../shared/models';
import * as moment from 'moment';

const kpiIdNameList = require('graphql-tag/loader!../graphql/kpi-list.query.gql');

// TODO: Implement a getAvailableFieldsQuery in the backed.
// now using KPIGroupings for testing purposes
const kpiGroupingsQuery = require('graphql-tag/loader!./kpi-groupings.query.gql');

@Injectable()
export class FunnelService {
    private _funnelModel: IFunnel;
    set funnelModel(value: IFunnel) {
        this._funnelModel = value;
    }
    get funnelModel(): IFunnel { return this._funnelModel; }

    private _fg: FormGroupTypeSafe<IFunnel>;
    get fg(): FormGroupTypeSafe<IFunnel> {
        return this._fg;
    }

    kpiSelectionList: SelectionItem[] = [];

    stagesSelectionList$ = new BehaviorSubject<SelectionItem[]>([]);

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
            id: guid(),
            name: 'New Stage'
        };

        this._funnelModel.stages.push(newStage);

        this._emitStagesList();
    }

    updateStage(stage: IFunnelStage, props: IFunnelStage) {
        const { name } = props;
        const foundStage = this._funnelModel.stages.find(s => s === stage);

        if (!foundStage) {
            console.log('funnel stage not found');
            return;
        }

        foundStage.name = name;

        this._emitStagesList();
    }

    private _emitStagesList() {
        const stagesSelectionList
        = ToSelectionItemList(this._funnelModel.stages, 'id', 'name');

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



}
