import { Injectable } from '@angular/core';
import { IListItem } from '../../shared/ui/lists/list-item';
import { KPITypeEnum } from '../../shared/domain/kpis/kpi';

@Injectable()
export class AddKpiViewModel {
    kpiTypes: IListItem[] = [
        {
            id: KPITypeEnum.Simple,
            imagePath: '/assets/img/kpis/puzzle-simple.jpg',
            title: 'Simple',
            subtitle: 'Create Simple KPIs'
        },
        {
            id: KPITypeEnum.Complex,
            imagePath: '/assets/img/kpis/puzzle-complex.jpg',
            title: 'Complex',
            subtitle: 'Create More Complex KPIs'
        },
        {
            id: KPITypeEnum.ExternalSource,
            imagePath: '/assets/img/kpis/external-source-kpi.jpg',
            title: 'External Source',
            subtitle: 'Create KPIs from connected datasources'
        }
    ];

    selectedType: KPITypeEnum;

    constructor() {
        this.selectedType = KPITypeEnum.None;
    }
}
