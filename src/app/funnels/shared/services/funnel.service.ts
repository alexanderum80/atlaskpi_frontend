import { Injectable } from '@angular/core';

import { Apollo } from 'apollo-angular';
import { filter, map, tap, catchError } from 'rxjs/operators';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { SelectionItem, guid } from '../../../ng-material-components';
import { ToSelectionItemList } from '../../../shared/extentions';
import { FormGroupTypeSafe, UserService } from '../../../shared/services';
import { IFunnel, IFunnelStage, IFunnelStageOptions } from '../models/funnel.model';
import { IKpiDateRangePickerDateRange } from '../models/models';
import { ApolloService } from '../../../shared/services/apollo.service';
import { isEmpty } from 'lodash';
import { IChartDateRange, convertDateRangeToStringDateRange, AKPIDateFormatEnum, IUserInfo } from '../../../shared/models';
import * as moment from 'moment';
import { IRenderedFunnel, IRenderedFunnelStage } from '../models/rendered-funnel.model';
import { cloneDeep } from 'lodash';
import { objectWithoutProperties2 } from '../../../shared/helpers/object.helpers';

const kpiIdNameList = require('graphql-tag/loader!../graphql/kpi-list.query.gql');
const renderFunnelByDefinitionQuery
    = require('graphql-tag/loader!../graphql/render-funnel-by-definition.query.gql');


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
    set fg(form: FormGroupTypeSafe<IFunnel>) {
        this._fg = form;
    }
    get fg(): FormGroupTypeSafe<IFunnel> {
        return this._fg;
    }

    kpiSelectionList: SelectionItem[] = [];

    stagesSelectionList$ = new BehaviorSubject<SelectionItem[]>([]);

    renderedFunnelModel: IRenderedFunnel = {
        name: 'Sample Funnel',
        stages: []
    };

    renderedFunnelModel$ = new BehaviorSubject<IRenderedFunnel>(null);
    currentUser: IUserInfo;

    constructor(
        private apollo: Apollo,
        private _apolloService: ApolloService,
        private _userService: UserService,

    ) {
        this.currentUser = this._userService.user;
    }

    loadFormDependencies$(): Observable<boolean> {
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

        this.emitStagesList();
    }

    removeStage(stage: IFunnelStage) {
        this._funnelModel.stages = this.funnelModel.stages.filter(s => s !== stage);
        this.emitStagesList();
    }

    updateFunnelName(name: string) {
        if (!this.renderedFunnelModel) { return; }

        this.renderedFunnelModel.name = name;
        this.renderedFunnelModel$.next(this.renderedFunnelModel);
    }

    updateStage(stage: IFunnelStage, props: IFunnelStageOptions) {
        const { name } = props;
        const foundDataModelStage = this._funnelModel.stages.find(s => s === stage);

        if (!foundDataModelStage) {
            console.log('funnel stage not found');
            return;
        }

        foundDataModelStage.name = name;

        // preview

        if (!this.renderedFunnelModel) { return; }

        const foundPreviewModelStage = this.renderedFunnelModel.stages.find(s => s._id === stage._id);

        if (!foundPreviewModelStage) {
            console.log('funnel preview stage not found');
            return;
        }

        foundPreviewModelStage.name = name;

        this.renderedFunnelModel$.next(this.renderedFunnelModel);
        this.emitStagesList();
    }

    async renderFunnelByDefinition(funnelModel: IFunnel) {
        let rendered;

        const input = cloneDeep(funnelModel);

        let count = 1;
        for (const stage of input.stages) {
             // transform the date Range to ChartDateRange
             const stageDr = stage.dateRange as IKpiDateRangePickerDateRange;

             const newDateRange = {
                 predefined: stageDr.predefinedDateRange,
                 custom: null,
             };

             if (stageDr.from && stageDr.to ) {
                 const from = moment(stageDr.from).format(AKPIDateFormatEnum.US_DATE);
                 const to = moment(stageDr.to).format(AKPIDateFormatEnum.US_DATE);
                 newDateRange.custom = {
                     from,
                     to
                 };
             }
             stage.dateRange = newDateRange;

             // put the order
             stage.order = count;

             count += 1;
        }

        try {
            const res = await this.apollo.query<{ renderFunnelByDefinition: IRenderedFunnel }>({
                query: renderFunnelByDefinitionQuery,
                variables: { input },
                fetchPolicy: 'network-only',
            }).toPromise();

            if (res.data) {
                rendered = res.data.renderFunnelByDefinition;
            }

        } catch (err) {
            console.log(err);
        }

        this.renderedFunnelModel = (<any>objectWithoutProperties2(rendered, ['__typename']));
        this.renderedFunnelModel$.next(this.renderedFunnelModel);
    }

    performFunnelInvalidFlow() {
        this.renderedFunnelModel = null;
        this.renderedFunnelModel$.next(this.renderedFunnelModel);
    }

    getFormData() {
        const data = cloneDeep(this._fg.value);

        let count = 1;
        for (const stage of data.stages) {

             // transform the date Range to ChartDateRange
             const stageDr = stage.dateRange as IKpiDateRangePickerDateRange;

             const newDateRange = {
                 predefined: stageDr.predefinedDateRange,
                 custom: null,
             };

             if (stageDr.from && stageDr.to ) {
                 const from = moment(stageDr.from).format(AKPIDateFormatEnum.US_DATE);
                 const to = moment(stageDr.to).format(AKPIDateFormatEnum.US_DATE);
                 newDateRange.custom = {
                     from,
                     to
                 };
             }
             stage.dateRange = newDateRange;

             // transform delimited string to array
             stage.fieldsToProject = String(stage.fieldsToProject).split('|');

             // put the order
             stage.order = count;
             count += 1;
        }

        // add-created-updated-by-date
        data.createdBy = this.currentUser._id;
        data.updatedBy = this.currentUser._id;
        data.createdDate = moment().toDate();
        data.updatedDate = moment().toDate();

        return data;
    }

    get formValid() {
        return this._fg && this._fg.valid;
    }

    emitStagesList() {
        const stagesSelectionList
        = ToSelectionItemList(this._funnelModel.stages, '_id', 'name');

        this.stagesSelectionList$.next(stagesSelectionList);
    }

    private _getGroupingInfoInput(kpi: string, dateRange: IKpiDateRangePickerDateRange): { ids: string[], dateRange: IChartDateRange[] } {
        const dr = { predefined: dateRange.predefinedDateRange, custom: null};

        // process custom dateRange
        if (dateRange.from && dateRange.to) {
            dr.custom = {
                from: moment(dateRange.from).format('MM/DD/YYYY'),
                to: moment(dateRange.to).format('MM/DD/YYYY')
            };
        }

        return {
            ids: [kpi],
            dateRange: [dr]
        };
    }

    private _tryToRender(value: IFunnel) {
        if (!value || !value.name) { return; }

        const { name = '', stages = [] } = value;

        this.renderedFunnelModel = this.renderedFunnelModel || { name: '', stages: []};

        // this._renderedFunnelModel.name = name;

        this.renderedFunnelModel$.next(this.renderedFunnelModel);
    }

}
