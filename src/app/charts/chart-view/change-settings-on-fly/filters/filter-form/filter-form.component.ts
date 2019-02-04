import { Subject } from 'rxjs/Subject';
import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    Input,
    OnChanges,
    OnDestroy,
    SimpleChanges,
ViewChild,
ElementRef,
Renderer,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Apollo } from 'apollo-angular';
import { Subscription } from 'rxjs/Subscription';

import {
    SelectPickerComponent,
} from '../../../../../ng-material-components/modules/forms/select-picker/select-picker.component';
import { IDataSource, IDataSourceField, IDataSourceFilterFields } from '../../../../../shared/domain/kpis/data-source';
import { CommonService } from '../../../../../shared/services/common.service';
import { ChangeSettingsOnFlyFilterFormViewModel } from './filter-form.viewmodel';
import 'rxjs/add/observable/combineLatest';
import { Observable } from 'rxjs/Observable';
import { isEmpty } from 'lodash';
import {objectWithoutProperties} from '../../../../../shared/helpers/object.helpers';

const criteriaQuery = require('graphql-tag/loader!./kpi-criteria.gql');
const kpiFilterFieldsQuery = require('graphql-tag/loader!./kpi-filter-fields.query.gql');

@Component({
    selector: 'kpi-change-settings-filter-form',
    templateUrl: './filter-form.component.pug',
    styleUrls: ['./filter-form.component.scss'],
    providers: [
        ChangeSettingsOnFlyFilterFormViewModel
    ]
})
export class ChangeSettingsOnFlyFilterFormComponent implements AfterViewInit, OnChanges, OnDestroy {
    @Input() filter: FormGroup;
    @Input() dataSource: IDataSource;
    @Input() collectionSource: string;

    @Input() fromRequired = false;
    @Input() toRequired = false;

    loading: ElementRef;
    isLoading = true;

    public sourcesAndCollectionPairSubject: Subject<any> = new Subject();

    // @ViewChild('vmOperators') set operators(content: SelectPickerComponent) {
    //     if (content) {
    //         this.vm.vmOperators = content;
    //     }
    // }

    // @ViewChild('vmFields') set fields(content: SelectPickerComponent) {
    //     if (content) {
    //         this.vm.vmFields = content;
    //     }
    // }

    // @ViewChild('vmCriteria') set criterias(content: SelectPickerComponent) {
    //     if (content) {
    //         this.vm.vmCriteria = content;
    //     }
    // }

    // @ViewChild('vmCriteria') criteriaSelectPicker: SelectPickerComponent;

    @ViewChild('loading') set loadingId(content: ElementRef) {
        if (content) {
            this.loading = content;
        }
    }

    private _kpiFilterCriteriaObservable: any;
    public subs: Subscription[] = [];

    constructor(
        public vm: ChangeSettingsOnFlyFilterFormViewModel,
        private _apollo: Apollo,
        private _cdr: ChangeDetectorRef,
        private _renderer: Renderer
    ) { }

    ngAfterViewInit() {
        const that = this;
        this.vm.initialize(this.filter);
        this._loadingSources();

        this.subs.push(this.vm.criteriaPayloadSubject.subscribe(payload => {
            that._getCriteriaList(payload);
        }));

        this._cdr.detectChanges();

        this.sourcesAndCollectionPairSubject
            .debounceTime(500)
            .distinctUntilChanged()
            .subscribe(value => {
                const a = value;
                if (value.dataSource) {
                    // this.vm.dataSourceValuesTracker = changes.dataSource;
                    this.vm.updateDataSource(value.dataSource as any);
                    this.vm.updateCollectionSource(value.collectionSource);

                    this._kpiFilterFieldsQuery(
                        value.dataSource,
                        value.CollectionSource
                    );
                }

                // this.vm.updateCriteriaPayload(value);
            });

        this.sourcesAndCollectionPairSubject.next({
            dataSource: this.dataSource,
            collectionSource: this.collectionSource
        });
    }

    ngOnChanges(changes: SimpleChanges) {
        // if (changes.dataSource) {
        //     // this.vm.dataSourceValuesTracker = changes.dataSource;
        //     this.vm.updateDataSource(changes.dataSource.currentValue as any);
        // }
        // if (changes.collectionSource) {
        //     this.vm.updateCollectionSource(changes.collectionSource.currentValue);
        // }

        this.sourcesAndCollectionPairSubject.next({
            dataSource: this.dataSource,
            collectionSource: this.collectionSource
        });

        // const that = this;
        // Observable.of(changes.dataSource)
        // .debounceTime(300)
        // .distinctUntilChanged()
        // .subscribe(() => {
        //     if (changes.dataSource || changes.collectionSource) {
        //         let dataSource: IDataSource;
        //         let collectionSource: string;

        //         if (changes.dataSource) {
        //             dataSource = changes.dataSource.currentValue;
        //         }
        //         if (changes.collectionSource) {
        //             collectionSource = changes.collectionSource.currentValue;
        //         }

        //         that._kpiFilterFieldsQuery(dataSource, collectionSource);
        //     }
        // });

    }

    ngOnDestroy() {
        this.vm.unsubscribe();
        CommonService.unsubscribe(this.subs);
    }

    private _getCriteriaList(payload: any): void {
        if (payload) {
            const that = this;

            this.subs.push(this._apollo.query<any>({
                query: criteriaQuery,
                fetchPolicy: 'network-only',
                variables: {
                    input: payload
                }
            }).subscribe(result => {
                that.isLoading = false;
                let criteriaValues = [];
                if (result && result.data) {
                    criteriaValues = result.data.kpiCriteria.criteriaValue;
                }
                that.vm.updateSelectableCriteria(criteriaValues);
            }));
        }
    }

    /**
     * i.e collectionSource = 'Nextech ( nextech )
     * i.e. dataSource = 'established_customers_sales'
     */
    private _kpiFilterFieldsQuery(dataSource: IDataSource, collectionSource: string): void {
        if (isEmpty(dataSource)) {
            return;
        }

        const that = this;

        const fields: IDataSourceField[] = dataSource.fields
                        .map((field: IDataSourceField) => objectWithoutProperties(field, ['__typename'])) as IDataSourceField[];
        const source: string[] = collectionSource ? collectionSource.split('|') : [];

        const input: IDataSourceFilterFields = {
            collectionSource: source,
            dataSource: dataSource.name,
            fields: fields
        };

        this.subs.push(
            that._apollo.query<{
                kpiFilterFields: IDataSourceField[]
            }>({
                query: kpiFilterFieldsQuery,
                variables: {
                    input: input
                },
                fetchPolicy: 'network-only'
            }).subscribe(({ data }) => {
                that.isLoading = false;
                if (!data || isEmpty(data.kpiFilterFields)) {
                    return;
                }

                that.vm.updateFilterFields(data.kpiFilterFields);
                that.vm._onFieldChange(this.filter.get('field').value);
            })
        );
    }

    private _loadingSources(): void {
        let interval: any;
        if (this.isLoading && this.loading) {
            const that = this;
            let text = '';
            interval = setInterval(() => {
                text += '.';

                if (text.length === 8) {
                    text = '';
                }
                that._renderer.setElementProperty(
                    that.loading.nativeElement,
                    'innerHTML',
                    `Loading KPI filters ${text}`
                );
            }, 200);
        } else {
            clearInterval(interval);
        }
    }
}
