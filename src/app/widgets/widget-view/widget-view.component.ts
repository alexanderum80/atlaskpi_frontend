import { CommonService } from '../../shared/services';
import { DeleteWidgetActivity } from '../../shared/authorization/activities/widgets/delete-widget.activity';
import { UpdateWidgetActivity } from '../../shared/authorization/activities/widgets/update-widget.activity';
import { Component, EventEmitter, Input, OnInit, OnChanges, Output, SimpleChanges, OnDestroy } from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import { Chart } from 'angular-highcharts';
import { isEmpty } from 'lodash';

import { MenuItem } from '../../dashboards/shared/models';
import { abbreviate_number } from '../../shared/extentions/utils';
import { IChart } from '../../charts/shared/models/chart.models';
import { ValueFormatHelper } from '../../shared/helpers/format.helper';
import { IWidget } from '../shared/models/widget.models';
import {WidgetViewViewModel} from './widget-view.viewmodel';
import { Apollo } from 'apollo-angular';
import { Subscription } from 'rxjs/Subscription';
import { CloneWidgetActivity } from 'src/app/shared/authorization/activities/widgets/clone-widget.activity';

const Highcharts = require('highcharts/js/highcharts');
const scheduleJobByWidgetIdGql = require('graphql-tag/loader!./scheduleJob-by-widget-id.query.gql');

@Component({
    selector: 'kpi-widget-view',
    templateUrl: './widget-view.component.pug',
    styleUrls: ['./widget-view.component.scss'],
    providers: [WidgetViewViewModel, CloneWidgetActivity,
                UpdateWidgetActivity, DeleteWidgetActivity]
})
export class WidgetViewComponent implements OnInit, OnChanges, OnDestroy {
    @Input() widget: IWidget;
    @Input() widgetPreview: boolean;
    @Output() done = new EventEmitter<any>();

    chart: Chart;
    showDescription = false;
    descriptionAnimation: string;

    private _chartInstance: Highcharts.Chart;
    private _subscription: Subscription[] = [];

    actionInfoItem: MenuItem = {
        id: 'info',
        icon: 'info-outline',
        title: 'Info'
    };

    // widgetActionItems
    actionItems: MenuItem[] = [{
        id: '3',
        icon: 'more-vert',
        children: [
            {
                id: 'info',
                icon: 'info-outline',
                title: 'Info'
            }, {
                id: 'alert',
                icon: 'notifications',
                title: 'Alerts'
            }, {
                id: 'clone',
                icon: 'copy',
                title: 'Clone'
            },
            {
                id: 'edit',
                icon: 'edit',
                title: 'Edit'
            }, {
                id: 'delete',
                icon: 'delete',
                title: 'Delete'
            }
        ]
    }];

    constructor(
        private sanitizer: DomSanitizer,
        private _apollo: Apollo,
        public vm: WidgetViewViewModel,
        public updateWidgetActivity: UpdateWidgetActivity,
        public deleteWidgetActivity: DeleteWidgetActivity,
        public cloneWidgetActivity: CloneWidgetActivity,
    ) {}

    ngOnChanges(changes: SimpleChanges) {
        if (this.widget) {
            this._removeInfoItem();
            if (this.widget.materialized && this.widget.materialized.chart) {
                this._renderChart();
            }
        }

        const widgetChange = changes['widget'];
        if (widgetChange.previousValue && widgetChange.previousValue.size !== widgetChange.currentValue.size &&
            widgetChange.currentValue.type === 'chart') {
            this._renderChart();
        }

        const widgetPreviewChanges = changes['widgetPreview'];
        if (widgetPreviewChanges) {
            if (widgetPreviewChanges.currentValue) {
                const infoItem: MenuItem = Object.assign({}, this.actionInfoItem);

                infoItem.active = true;
                delete infoItem.title;

                this.actionItems.length = 0;
                this.actionItems = [infoItem];
            }
            this.widgetPreview = widgetPreviewChanges.currentValue;
        }
    }

    ngOnInit() {
        this.vm.addActivities([this.updateWidgetActivity,
                                this.deleteWidgetActivity,
                                this.cloneWidgetActivity]);
        this._disabledActionItem();
    }

    ngOnDestroy() {
        CommonService.unsubscribe(this._subscription);
    }

    private _renderChart() {
        const chart = < IChart > JSON.parse(this.widget.materialized.chart);
        const chartDefinition = this._minifyChart(chart);
        this.chart = new Chart(chartDefinition);
        // TODO: Improve this
        // this fixes the issue of charts outside the container
        // https://www.e-learn.cn/content/wangluowenzhang/133147
        // this forces the chart to get the container height
        // setTimeout(() => {
        //     this.chart.ref.reflow();
        // }, 0);

        // Highcarts 6 offers and Observable of the ChartObject
        this.chart.ref$.subscribe(ref => {
            setTimeout(() => {
                ref.reflow();
            }, 0);
        });
    }

    private _removeInfoItem(): void {
        if (!Array.isArray(this.actionItems) && isEmpty(this.actionItems)) {
            return;
        }

        let children = this.actionItems[0].children;
        const that = this;
        if (this.widget && !this.widget.description && children) {
            children = children.filter(child => child.id !== 'info');
        }

        if (this.actionItems[0].children) {
            this.actionItems[0].children = children;
        }
    }

  // find the object in the array of actionItems
  // set disabled to boolean value
    private _disabledActionItem(): void {
        if (this.actionItems && this.actionItems.length) {
            const itemAction = this.actionItems[0];
            if (itemAction.children) {
                itemAction.children.forEach(item => {
                    if (item.id === 'edit') {
                        item.disabled = this._editWidgetPermission();
                    }
                    if (item.id === 'delete') {
                        item.disabled = this._deleteWidgetPermission();
                    }
                    if (item.id === 'clone') {
                        item.disabled = this._cloneWidgetPermission();
                    }
                });
            }
        }
    }

    // check if user have permission to edit widget
    private _editWidgetPermission() {
        return !this.vm.authorizedTo('UpdateWidgetActivity');
    }

    // check if user have permission to delete widget
    private _deleteWidgetPermission() {
        return !this.vm.authorizedTo('DeleteWidgetActivity');
    }

    // check if user have permission to clone widget
    private _cloneWidgetPermission() {
        return !this.vm.authorizedTo('CloneWidgetActivity');
    }

    saveInstance(chartInstance: Highcharts.Chart) {
        this._chartInstance = chartInstance;
    }

    onActionClicked(item: MenuItem) {
        item['payload'] = { id: this.widget._id };
        item['widget'] = this.widget;

        switch (item.id) {
            case 'info':
                if (this.showDescription) {
                    this.descriptionAnimation = 'fadeOut';
                    setTimeout(() => this.showDescription = false, 1000);
                } else {
                    this.showDescription = true;
                    this.descriptionAnimation = 'fadeIn';
                }
                break;
            case 'alert':
                this.done.emit(item);
                break;
            case 'clone':
                this.done.emit(item);
                break;
            case 'edit':
                this.done.emit(item);
                break;
            case 'delete':
                this.done.emit(item);
                break;
            default:
                return;
        }
    }

    private _minifyChart(definition: any): any {
        definition.exporting = definition.exporting || {};
        definition.exporting.enabled = false;
        definition.credits = {
            enabled: false
        };
        definition.legend = {
            enabled: false
        };
        definition.tooltip = {
            enabled: false
        };
        definition.plotOptions = definition.plotOptions || {};
        definition.plotOptions.series = definition.plotOptions.series || {};
        definition.plotOptions.series.enableMouseTracking = false;
        definition.title = undefined;
        definition.subtitle = undefined;
        return definition;
    }

    get chartStyle() {
        switch (this.widget.size) {
            case 'small':
                return this.sanitizer.bypassSecurityTrustStyle('min-height: 100px; min-width: 100px; max-height: 100px; max-width: 100px;');

            case 'big':
                return this.sanitizer.bypassSecurityTrustStyle('min-height: 100px; min-width: 240px; max-height: 100px; max-width: 240px;');
        }
    }

    get showNotificationBell(): boolean {
        return this.widget.hasAlerts && !this.widgetPreview;
    }

    get widgetBackgroundColor() {
        if (!this.widget) {
            return;
        }
        return this.widget.materialized && this.widget.materialized.chart ? 'white' : this.widget.color;
    }

    get noWidgetType() {
        return !this.widget.type;
    }

    get widgetNumericInvalid() {
        return this.widgetNumericView &&
                                this.widget.numericWidgetAttributes &&
                                (!this.widget.numericWidgetAttributes.kpi || !this.widget.numericWidgetAttributes.dateRange);
    }

    get widgetChartInvalid() {
        return this.widgetChartView &&
                            this.widget.chartWidgetAttributes &&
                            (!this.widget.chartWidgetAttributes.chart);
    }

    get widgetNumericView() {
        return this.widget.type === 'numeric';
    }

    get widgetChartView() {
        return this.widget.type === 'chart';
    }

    get widgetValue() {
        if (!this.widget) {
            return;
        }
    if (!this.widget.type) { return false; }

        if (this.widget.materialized && !Number.isNaN(this.widget.materialized.value)) {
            return this.widget.size === 'small' ?
                ValueFormatHelper.ApplyFormat(abbreviate_number(Number(this.widget.materialized.value), 0),
                    this.widget.numericWidgetAttributes.format || 'none') :
                ValueFormatHelper.ApplyFormat(String(this.widget.materialized.value),
                    this.widget.numericWidgetAttributes.format || 'none');

        }
        return null;
    }

    get widgetComparisonPeriod() {
        if (!this.widget) {
            return;
        }
        return this.widget.materialized && this.widget.materialized.comparison ?
            this.widget.materialized.comparison.period :
            null;
    }

    get widgetComparisonValue() {
        if (!this.widget) {
            return;
        }
        if (this.widget.materialized && this.widget.materialized.comparison) {
            return this.widget.size === 'small' ?
                ValueFormatHelper.ApplyFormat(abbreviate_number(Number(this.widget.materialized.comparison.value), 0),
                    this.widget.numericWidgetAttributes.format || 'none') :
                ValueFormatHelper.ApplyFormat(Number(this.widget.materialized.comparison.value).toLocaleString(),
                    this.widget.numericWidgetAttributes.format || 'none');
        }
        return null;
    }


    get widgetArrow() {
        if (!this.widget) { return; }
        if (this.widget.materialized && this.widget.materialized.comparison && this.widget.materialized.value ) {
            return Number(this.widget.materialized.value) >  Number(this.widget.materialized.comparison.value)
            ? 'up'
            : 'down';

        }
    }

    get description() {
        if (this.actionItems.length === 1 && !this.actionItems[0].children) {
            if (this.widget.description) {
                return true;
            }
            return false;
        }
        return true;
    }

    get widgetArrowColor() {
        let arrowCompare: string ;
        arrowCompare = this.widgetArrow;
        if (!this.widget.materialized.comparison.arrowDirection || !arrowCompare) {
            return;
        } else {
        return  arrowCompare === this.widget.numericWidgetAttributes.comparisonArrowDirection
            ? 'green'
            : 'red';
        }
    }


    get Porcent() {

        let arrowCompare: string;
        let porcent: any;
        porcent = 0;
        arrowCompare = this.widgetArrow;

        if ( this.widget.materialized && this.widget.materialized.comparison  && this.widget.materialized.value
        && !(this.widget.materialized.comparison.value === null)  && (Number(this.widget.materialized.comparison.value) !== 0)) {

        porcent = ( Number(this.widget.materialized.value) - Number(this.widget.materialized.comparison.value))
        /  Number(this.widget.materialized.comparison.value) * 100;

        if (porcent < 0) {
        porcent = -porcent;
        }
        porcent = abbreviate_number(Number(porcent), 2);

        return ( arrowCompare  === 'up') ? '+' + porcent  : '-' + porcent ;

        } else {
            return;
        }
    }
}
