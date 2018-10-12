import { SelectPickerComponent } from '../../ng-material-components/modules/forms/select-picker/select-picker.component';
import { CommonService } from '../../shared/services/common.service';
import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    ViewChild,
    ElementRef,
    OnDestroy,
    OnInit,
    Output,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { Subscription } from 'rxjs/Subscription';

import { SelectionItem } from '../../ng-material-components';
import { DialogResult } from '../../shared/models/dialog-result';
import { IWidget } from '../shared/models';
import { ValueFormatHelper } from '../../shared/helpers/format.helper';
import { WidgetsFormService } from './widgets-form.service';
import { IDatePickerConfig } from '../../ng-material-components/modules/forms/date-picker/date-picker/date-picker-config.model';
import { ApolloService } from '../../shared/services/apollo.service';

import { IDateRangeItem } from './../../shared/models/date-range';
import { chartsGraphqlActions } from '../../charts/shared/graphql/charts.graphql-actions';

const widgetSizeList: SelectionItem[] = [
    {
        id: 'small',
        title: 'Small',
    },
    {
        id: 'big',
        title: 'Big',
    },
];

const widgetTypeList: SelectionItem[] = [
    {
        id: 'numeric',
        title: 'Numeric',
    },
    {
        id: 'chart',
        title: 'Chart',
    },
];

const widgetOrderList: SelectionItem[] = [
    {
        id: '1',
        title: '1',
    },
    {
        id: '2',
        title: '2',
    },
    {
        id: '3',
        title: '3',
    },
    {
        id: '4',
        title: '4',
    },
];

const widgetColorList: SelectionItem[] = [
    {
        id: 'white',
        title: 'white',
    },
    {
        id: 'orange',
        title: 'orange',
    },
    {
        id: 'blue',
        title: 'blue',
    },
    {
        id: 'green',
        title: 'green',
    },
    {
        id: 'light-green',
        title: 'light-green',
    },
    {
        id: 'sei-green',
        title: 'sei-green',
    },
    {
        id: 'purple',
        title: 'purple',
    },
    {
        id: 'light-purple',
        title: 'light-purple',
    },
    {
        id: 'pink',
        title: 'pink',
    },
];

const comparisonDirectionArrowList: SelectionItem[] = [
    {
        id: 'none',
        title: 'None',
    },
    {
        id: 'up',
        title: 'Arrow Up',
    },
    {
        id: 'down',
        title: 'Arrow Down',
    },
];

const widgetByTitleQuery = require('graphql-tag/loader!../shared/graphql/get-widget-by-name.gql');

@Component({
    selector: 'kpi-widget-form',
    templateUrl: './widget-form.component.pug',
    styleUrls: ['./widget-form.component.scss'],
})
export class WidgetFormComponent implements OnInit, AfterViewInit, OnDestroy {
    @Input()
    fg: FormGroup;
    @Input()
    editMode = false;
    @Input()
    widgetId: string;
    @Input()
    widgetDataFromKPI: any;
    @Output()
    formResult = new EventEmitter<DialogResult>();

    subs: Subscription[] = [];
    datePickerConfig: IDatePickerConfig;
    widgetModelValid = false;
    widgetSize: string;
    smSize: string;

    sizeSelectionList: SelectionItem[] = widgetSizeList;
    typeSelectionList: SelectionItem[] = widgetTypeList;
    orderSelectionList: SelectionItem[] = widgetOrderList;
    colorSelectionList: SelectionItem[] = widgetColorList;
    comparisonArrowDirectionSelectionList: SelectionItem[] = comparisonDirectionArrowList;
    valueFormatList: SelectionItem[] = ValueFormatHelper.GetFormatSelectionList();

    dateRangeSelectionList: SelectionItem[] = [];
    kpiSelectionList: SelectionItem[] = [];
    dashboardSelectionList: SelectionItem[] = [];
    chartSelectionList: SelectionItem[] = [];
    comparisonSelectionList: SelectionItem[] = [];

    private _widgetReadySub: Subscription;
    private _widgetModel: IWidget;

    constructor(
        private _widgetFormService: WidgetsFormService,
        private _apollo: Apollo,
        private _router: Router,
        private _apolloService: ApolloService,
        private cdr: ChangeDetectorRef,
    ) {}

    ngOnInit() {
        this.datePickerConfig = {
            showGoToCurrent: false,
            format: 'MM/DD/YYYY',
        };
    }

    ngAfterViewInit() {
        const that = this;
        this.widgetModel = this._widgetFormService.widgetModel;
        this.widgetModel.preview = true;
        this._subscribeToFormFields();

        const widgetData = this._widgetFormService.getWidgetFormValues();

        if (this.widgetDataFromKPI) {
            widgetData.name = this.widgetDataFromKPI.name;
            widgetData.size = this.widgetDataFromKPI.size;
            widgetData.kpi = this.widgetDataFromKPI.kpi;
            widgetData.color = this.widgetDataFromKPI.color;
            widgetData.predefinedDateRange = this.widgetDataFromKPI.predefinedDateRange;
            widgetData.format = this.widgetDataFromKPI.format;
            widgetData.comparison = this.widgetDataFromKPI.comparison;
            widgetData.comparisonArrowDirection = this.widgetDataFromKPI.comparisonArrowDirection;

            this.fg.patchValue(widgetData);

            this._apolloService.networkQuery<IDateRangeItem[]>(chartsGraphqlActions.dateRanges).then(res => {
                const dateRanges = res.dateRanges;
                const listDateRange = dateRanges.find(d => d.dateRange.predefined === widgetData.predefinedDateRange);
                const listComparison = listDateRange.comparisonItems.map(i => ({ id: i.key, title: i.value }));
                this.comparisonSelectionList = listComparison;
            });
        } else {
            this.fg.patchValue(widgetData);
        }

        this._subscribeToServiceObservables();

        this.fg.get('predefinedDateRange').valueChanges.subscribe(newDateRange => {
            that.updateComparisonItems(newDateRange);
        });
        that.updateComparisonItems(this.fg.value.predefinedDateRange);
        this.cdr.detectChanges();

        this._widgetFormService.updateExistDuplicatedName(false);
        this._subscribeToNameChanges();
    }

    ngOnDestroy() {
        CommonService.unsubscribe([...this.subs, ...this._widgetFormService.subscriptions]);
    }

    get widgetModel(): IWidget {
        return this._widgetModel;
    }

    set widgetModel(value: IWidget) {
        this._widgetModel = value;

        if (this._widgetModel) {
            this.widgetSize = this._widgetModel.size;
            this.smSize = '100';
            //  === 'big' ?
            //     'flex-100 flex-gt-xs-100 flex-gt-sm-50 flex-gt-lg-33'
            //     : 'flex-xs-100 flex-gt-xs-50 flex-gt-sm-25 flex-gt-lg-15';
        }
    }

    get isNumericWidget() {
        return this.fg.value.type === 'numeric';
    }

    get isChartWidget() {
        return this.fg.value.type === 'chart';
    }

    get showChartWidgetSettings() {
        return !this.fg.value.type || this.isNumericWidget;
    }

    get showNumericWidgetSettings() {
        return !this.fg.value.type || this.isChartWidget;
    }

    get isWidgetBig() {
        return this.widgetSize === 'big';
    }

    get isDateRangeCustom() {
        return this.fg.value.predefinedDateRange === 'custom';
    }

    updateComparisonItems(dateRange) {
        if (!dateRange) {
            this.comparisonSelectionList = [];
            return;
        }
        this.comparisonSelectionList = this._widgetFormService.getComparisonListForDateRange(dateRange);
    }

    private _subscribeToFormFields() {
        const that = this;
        this.subs.push(
            this.fg.valueChanges
                .debounceTime(500)
                .distinctUntilChanged()
                .subscribe(values => {
                    const fieldNames = Object.keys(values);

                    this._widgetFormService.processFormChanges(values).then(widget => (this.widgetModel = widget));
                }),
        );
    }

    saveWidget() {
        if (!this.widgetModelValid) {
            return;
        }

        this.formResult.emit(DialogResult.SAVE);
    }

    cancel() {
        this.formResult.emit(DialogResult.CANCEL);
    }

    private _subscribeToServiceObservables() {
        this.widgetModel = this._widgetFormService.widgetModel;
        this.subs.push(this._widgetFormService.chartList$.subscribe(list => (this.chartSelectionList = list)));
        this.subs.push(this._widgetFormService.dateRangeList$.subscribe(list => (this.dateRangeSelectionList = list)));
        this.subs.push(this._widgetFormService.kpiList$.subscribe(list => (this.kpiSelectionList = list)));
        this.subs.push(this._widgetFormService.dashboardList$.subscribe(list => this.dashboardSelectionList = list));
        this.subs.push(this._widgetFormService.widgetModelValid$.subscribe(isValid => (this.widgetModelValid = isValid)));
    }

    private _subscribeToNameChanges() {
        this.fg.controls['name'].valueChanges.subscribe(n => {
            if (n === '') {
                this.fg.controls['name'].setErrors({ required: true });
            } else {
                if (this._widgetFormService.getExistDuplicatedName() === true) {
                    this._apolloService.networkQuery<IWidget>(widgetByTitleQuery, { name: n }).then(d => {
                        if (d.widgetByName && d.widgetByName._id !== (this.widgetId ? this.widgetId : 0)) {
                            this.fg.controls['name'].setErrors({ forbiddenName: true });
                        } else {
                            this.fg.controls['name'].setErrors(null);
                        }
                    });
                }
            }
        });
    }
}
