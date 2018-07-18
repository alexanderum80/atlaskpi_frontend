import { Injectable } from '@angular/core';
import { toArray } from 'lodash';

import { SelectionItem } from '../../ng-material-components/models/selection-item';
import { Field } from '../../ng-material-components/viewModels/field.decorator';
import { ViewModel } from '../../ng-material-components/viewModels/view-model';
import { PredefinedDateRanges } from '../../shared/models/date-range';
import { IDataSourceField } from '../../shared/domain/kpis/data-source';


export interface IShowMapPayload {
    dateRange: string;
    grouping: string;
}

@Injectable()
export class ShowMapFormViewModel extends ViewModel<IShowMapPayload> {

    dateRangeItems: SelectionItem[] = [];
    groupingItems: SelectionItem[] = [];
    dataSources: SelectionItem[];

    private groupings: IDataSourceField[];

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
        const groupField = this.groupings.find(f => f.path === this.grouping);
        // const groupingName = groupField ? groupField.name : '';
        return {
            dateRange: this.dateRange,
            grouping: groupField.name,
        };
    }

    updateAvailableGroupings(groupings: IDataSourceField[]) {
        this.groupings = groupings;
        this.groupingItems = groupings.filter(f =>
            f.allowGrouping
            && f.available && !f.path.toLocaleLowerCase().match(/zip|city|state|externalId/))
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
