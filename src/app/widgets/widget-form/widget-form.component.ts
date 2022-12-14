import { CommonService } from '../../shared/services/common.service';
import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    ViewChild,
    OnDestroy,
    OnInit,
    Output,
} from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { Subscription } from 'rxjs/Subscription';

import { SelectionItem } from '../../ng-material-components';
import { DialogResult } from '../../shared/models/dialog-result';
import { IWidget, IWidgetFormGroupValues } from '../shared/models';
import { ValueFormatHelper } from '../../shared/helpers/format.helper';
import { WidgetsFormService } from './widgets-form.service';
import { IDatePickerConfig } from '../../ng-material-components/modules/forms/date-picker/date-picker/date-picker-config.model';
import { ApolloService } from '../../shared/services/apollo.service';

import { widgetsGraphqlActions } from '../shared/graphql/widgets.graphql-actions';
import { ChooseColorsComponent } from '../../shared/ui/choose-colors/choose-colors.component';

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
    @Input() fg: FormGroup;
    @Input() editMode = false;
    @Input() widgetId: string;
    @Input() widgetDataFromKPI: any;
    @Output() formResult = new EventEmitter<DialogResult>();

    @ViewChild(ChooseColorsComponent) chooseColors: ChooseColorsComponent;

    selectColorCaller = '';

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
    loading = true;

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
        if (!this.fg.controls['color']) {
            const color = new FormControl(false);
            this.fg.addControl('color', color);
        }
        if (!this.fg.controls['fontColor']) {
            const fontColor = new FormControl(false);
            this.fg.addControl('fontColor', fontColor);
        }

        const widgetData = this._widgetFormService.getWidgetFormValues();
        let widgetDataFromKPI: IWidgetFormGroupValues;

        if (this.widgetDataFromKPI) {
            widgetData.name = this.widgetDataFromKPI.name;
            widgetData.size = this.widgetDataFromKPI.size;
            widgetData.kpi = this.widgetDataFromKPI.kpi;
            widgetData.color = this.widgetDataFromKPI.color;
            widgetData.fontColor = this.widgetDataFromKPI.fontColor;
            widgetData.predefinedDateRange = this.widgetDataFromKPI.predefinedDateRange;
            widgetData.format = this.widgetDataFromKPI.format;
            widgetData.comparison = this.widgetDataFromKPI.comparison;
            widgetData.comparisonArrowDirection = this.widgetDataFromKPI.comparisonArrowDirection;

            widgetDataFromKPI = {
                name: this.widgetDataFromKPI.name,
                description: 'Here goes the description',
                order: '4',
                type: 'numeric',
                size: widgetData.size,
                color: widgetData.color,
                comparison: this.widgetDataFromKPI.comparison,
                fontColor: widgetData.fontColor,
                comparisonArrowDirection: this.widgetDataFromKPI.comparisonArrowDirection,
                kpi: this.widgetDataFromKPI.kpi,
                predefinedDateRange: this.widgetDataFromKPI.predefinedDateRange,
                dashboards: ''
            };
        }

        this.fg.patchValue(widgetData);

        this._subscribeToServiceObservables();

        this.fg.get('predefinedDateRange').valueChanges.subscribe(newDateRange => {
            that.updateComparisonItems(newDateRange);
        });

        this.fg.get('kpi').valueChanges.subscribe(newKpi => {
            that.updateComparisonItems(this.fg.value.predefinedDateRange, newKpi);
        });

        that.updateComparisonItems(this.fg.value.predefinedDateRange, null, widgetDataFromKPI ? widgetDataFromKPI : null);
        this.cdr.detectChanges();

        this._subscribeToFormFields();

        this._widgetFormService.updateExistDuplicatedName(false);
        this._subscribeToNameChanges();
        this.loading = false;
    }

    ngOnDestroy() {
        CommonService.unsubscribe([...this.subs, ...this._widgetFormService.subscriptions]);
    }

    openSelectColor(colorCaller: string) {
        this.selectColorCaller = colorCaller;
        this.chooseColors.open();
    }

    onSelectColor(inputColor: string) {
        if (this.selectColorCaller === 'color') {
            this.widgetModel.color = inputColor;
            this.fg.controls['color'].patchValue(inputColor);
        } else if (this.selectColorCaller === 'font') {
            this.fg.controls['fontColor'].patchValue(inputColor);
            this.widgetModel.fontColor = inputColor;
        }
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

    updateComparisonItems(dateRange, kpiId?, values?) {
        if (!dateRange) {
            this.comparisonSelectionList = [];
            return;
        }
        this._apolloService
            .networkQuery < string > (widgetsGraphqlActions.kpiOldestDateQuery,
                { ids: kpiId ? [kpiId] : [this.fg.value.kpi] })
        .then(kpis => {
            this.comparisonSelectionList = this._widgetFormService
                .getComparisonListForDateRangesAndKpiOldesDate(dateRange, kpis.getKpiOldestDate);
                if (values) {
                    this._widgetFormService.processFormChanges(values).then(widget => {
                        this.widgetModel = widget;
                    });
                }
        });
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
