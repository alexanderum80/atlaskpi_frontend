import { Injectable } from '@angular/core';
import { IListItem } from '../../shared/ui/lists/list-item';
import { KPITypeEnum, IKPI } from '../../shared/domain/kpis/kpi';
import { isNumber } from 'lodash';

@Injectable()
export class EditKpiViewModel {
    private _kpi: IKPI;

    selectedType: number;

    constructor() { }

    get kpi(): IKPI {
        return this._kpi;
    }

    updateKpi(kpi: IKPI) {
        if (kpi !== this._kpi) {
            this._kpi = kpi;
        }

    }

    updateSelectedType(selectedType?: number): void {
        if (isNumber(selectedType) && selectedType === KPITypeEnum.None) {
            this.selectedType = KPITypeEnum.None;
        }
        this.selectedType = this.getSelectedType();
    }

    getSelectedType(): KPITypeEnum {
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
}
