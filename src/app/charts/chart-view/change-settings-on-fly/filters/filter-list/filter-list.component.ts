import { IDataSource } from './../../../../../shared/domain/kpis/data-source';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';

import { ApolloService } from '../../../../../shared/services/apollo.service';
import { ChangeSettingsOnFlyFilterListViewModel } from './filter-list.viewmodel';

@Component({
    selector: 'kpi-change-settings-filter-list',
    templateUrl: './filter-list.component.pug',
    styleUrls: ['./filter-list.component.scss'],
    providers: [ ChangeSettingsOnFlyFilterListViewModel ]
})
export class ChangeSettingsOnFlyFilterListComponent implements OnInit, OnDestroy {
    @Input() filters: FormArray;
    @Input() dataSource: IDataSource;
    @Input() collectionSource: string;

    constructor(
        private _apolloService: ApolloService,
        public vm: ChangeSettingsOnFlyFilterListViewModel
    ) { }

    ngOnInit() { }

    ngOnDestroy() {
        (this.filters as FormArray).controls.length = 0;
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
