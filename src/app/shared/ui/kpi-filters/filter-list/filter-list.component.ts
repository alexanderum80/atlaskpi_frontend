import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';

import { IDataSource } from '../../../../shared/domain/kpis/data-source';
import { ApolloService } from '../../../../shared/services/apollo.service';
import { FilterListViewModel } from './filter-list.viewmodel';
import { KPIFiltersService } from 'src/app/shared/services/kpi-filters.service';

@Component({
    selector: 'kpi-filter-list',
    templateUrl: './filter-list.component.pug',
    styleUrls: ['./filter-list.component.scss'],
    providers: [ FilterListViewModel ]
})
export class KpiFilterListComponent implements OnInit, OnDestroy {
    @Input() filters: FormArray;
    @Input() dataSource: IDataSource;
    @Input() collectionSource: string;

    constructor(
        private _apolloService: ApolloService,
        private _filterService: KPIFiltersService,
        public vm: FilterListViewModel
    ) { }

    ngOnInit() {}

    ngOnDestroy() {
        (this.filters as FormArray).controls.length = 0;
        this._filterService.resetFilterSubjects();
    }

    addFilter(): void {
        const that = this;
        that.filters.push(new FormGroup({}) as any);
    }

    removeFilter(filter: FormGroup) {
        if (!filter) {
            return;
        }

        const filterIndex = this.filters.controls.findIndex(c => c === filter);

        if (filterIndex > -1) {
            this.filters.removeAt(filterIndex);
        }
    }
}
