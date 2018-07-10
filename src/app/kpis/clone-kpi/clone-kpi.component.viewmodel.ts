import { Injectable } from '@angular/core';
import { IListItem } from '../../shared/ui/lists/list-item';
import { KPITypeEnum, IKPI } from '../../shared/domain/kpis/kpi';
import * as moment from 'moment';

@Injectable()
export class CloneKpiViewModel {
    private _kpi: IKPI;
    public clone = false;

    constructor() { }

    get selectedType(): KPITypeEnum {
        if (!this._kpi) {
            return KPITypeEnum.None;
        }

        switch (this._kpi.type) {
            case 'simple':
                return KPITypeEnum.Simple;
            case 'complex':
                return KPITypeEnum.Complex;
            case 'externalsource':
                return KPITypeEnum.ExternalSource;
            default:
                return KPITypeEnum.None;
        }
    }

    get kpi(): IKPI {
        return this._kpi;
    }

    updateKpi(kpi: IKPI) {

        if (kpi !== this._kpi) {
            this._kpi = {
                id: kpi.id,
                _id: null,
                code: kpi.code,
                name: kpi.name + ` (copy ${moment().format('H:mm:ss')})`,
                description: kpi.description,
                group: kpi.group,
                baseKpi: kpi.baseKpi,
                groupings: kpi.groupings,
                groupingInfo: kpi.groupingInfo,
                dateRange: kpi.dateRange,
                filter: kpi.filter,
                frequency: kpi.frequency,
                axisSelection: kpi.axisSelection,
                emptyValueReplacement: kpi.emptyValueReplacement,
                expression: kpi.expression,
                type: kpi.type,
                source: kpi.source
            };
        }
    }
}
