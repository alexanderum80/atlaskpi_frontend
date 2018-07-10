import { Injectable } from '@angular/core';
import { toArray } from 'lodash';

import { SelectionItem } from '../../ng-material-components/models/selection-item';
import { Field } from '../../ng-material-components/viewModels/field.decorator';
import { ViewModel } from '../../ng-material-components/viewModels/view-model';
import { PredefinedDateRanges } from '../../shared/models/date-range';
import {IDataSource, IDataSourceField} from '../../shared/domain/kpis/data-source';


export interface IShowMapPayload {
    dateRange: string;
    grouping: string;
}

@Injectable()
export class ShowMapFormViewModel extends ViewModel<IShowMapPayload> {

    dateRangeItems: SelectionItem[] = [];
    groupingItems: SelectionItem[] = [];
    dataSources: SelectionItem[];

    sourceFields: IDataSourceField[] = [];

    private _dataSources: IDataSource[];

    constructor() {
        super(null);
    }

    @Field({ type: String })
    dateRange: string;

    @Field({ type: String })
    grouping: string;

    initialize(model: IShowMapPayload) {
        this.onInit(model);
        this._setDateRangeList();
    }

    get payload(): IShowMapPayload {
        const dataSourceField = this.sourceFields.find(f => f.path === this.grouping);
        const groupingName = dataSourceField ? dataSourceField.name : '';
        return {
            dateRange: this.dateRange,
            grouping: groupingName,
        };
    }

    updateDataSources(dataSources: IDataSource[]) {
        if (!dataSources || this._dataSources === dataSources) {
            return;
        }

        // This is not needed now but it will be used in the future
        // this._dataSources = dataSources;
        // this.dataSources = dataSources.map(s => new SelectionItem(s.name, s.description.toUpperCase()));

        // const blackList = ['zip', 'city', 'state'];
        const source = dataSources.find(s => s.name === 'revenue_by_referrals');
        this.sourceFields = source.fields;

        this.groupingItems = source.fields
            .filter(f => f.allowGrouping && f.available && !f.path.toLocaleLowerCase().match(/zip|city|state|externalId/))
            .map(g => new SelectionItem(g.path, g.name));

        // this.groupingItems = RevenueGroupingList.filter(list => list.id !== 'customerZip');
    }

    private _setDateRangeList(): void {
        // get chart date ranges
        toArray(PredefinedDateRanges).forEach(predefinedDate => {
            this.dateRangeItems.push({
                id: predefinedDate,
                title: predefinedDate,
                selected: false,
                disabled: false
            });
        });
    }
}
