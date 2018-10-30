import { ChartGalleryService } from './../../services/chart-gallery.service';
import {FormatterFactory, yAxisFormatterProcess} from '../../../../dashboards/shared/extentions/chart-formatter.extention';
import {IChartGalleryItem} from '../../models';
import {FormGroup} from '@angular/forms';
import {
    AfterViewInit,
    Component,
    Input,
    NgZone,
    OnChanges,
    SimpleChanges,
    ViewChild,
    Output,
    EventEmitter
} from '@angular/core';
import {Chart} from 'angular-highcharts';
import {Subscription} from 'rxjs/Subscription';
import { IMapMarker } from '../../../../maps/shared/models/map-marker';
import { ILegendColorConfig } from '../../../../maps/show-map/show-map.component';
import { LegendService } from '../../../../maps/shared/legend.service';

export interface IChartSize {
    width: number;
    height: number;
}

@Component({
    selector: 'kpi-chart-preview',
    templateUrl: 'chart-preview.component.pug',
    styleUrls: ['./chart-preview.component.scss']
})
export class ChartPreviewComponent implements OnChanges, AfterViewInit {
    @Input()fg: FormGroup;
    @Input()chartDefinition: any;
    @Input()size: IChartSize;
    @Input()mapMarkers: IMapMarker[] = [];
    @Output() serieName = new EventEmitter <string>();

    title = 'Chart Name';
    chart: Chart;
    comparison = '';
    ischartTypeMap = false;
    legendColors: ILegendColorConfig[];

    constructor(private _chartGalleryService: ChartGalleryService,
                private _legendService: LegendService) {

    }
    vari = true;

    ngAfterViewInit() {
        this._subscribeToDefinitionChanges();
        this._subscribeToChartTypeChanges();
        this.legendColors = this._legendService.getLegendColors();
    }

    ngOnChanges(changes: SimpleChanges) {
        const that = this;
        this.comparison = this.fg.value.comparison;
        if (changes.chartDefinition && changes.chartDefinition.previousValue && changes.chartDefinition.previousValue.tooltip) {
            this.chartDefinition.tooltip = changes.chartDefinition.previousValue.tooltip;
        }
        this._chartToolTipFormatterProcess();
        yAxisFormatterProcess(this.chartDefinition);
        if (this.size) {
            if (this.chartDefinition) {
                if (this.chartDefinition.chart) {
                    this.chartDefinition.chart.width = this.size.width;
                    this.chartDefinition.chart.height = this.size.height;

                    if (this.chartDefinition.legend) {
                        this.chartDefinition.legend = Object.assign(this.chartDefinition.legend, {
                            itemEvents: {
                                contextmenu: function (e) {
                                    const selectedSerie = e.toElement.childNodes[0].data;
                                    that.serieName.emit(selectedSerie);
                                }
                            }
                        });
                    }
                }
                this.chart = new Chart(this.chartDefinition);
            }
        }
    }
    private _subscribeToChartTypeChanges() {
        const that = this;
        that._chartGalleryService.activeChart$.subscribe((chart) => {
            that.ischartTypeMap = chart.name === 'map';
            if (that.ischartTypeMap) {
                this.title = 'Map Name';
            } else {
                this.title = 'Chart Name';
            }
        });
    }
    get hasSeries(): boolean {
        if (!this.definitionAndSeriesExist) {
            return false;
        }
        return this.chartDefinition.series.length > 0;
    }

    get isSeriesEmpty(): boolean {
        if (!this.definitionAndSeriesExist) {
            return false;
        }

        return this.chartDefinition.series.length === 0;
    }

    get definitionAndSeriesExist(): boolean {
        if (!this.chartDefinition || !Array.isArray(this.chartDefinition.series)) {
            return false;
        }

        return true;
    }

    private _subscribeToDefinitionChanges() {
        const that = this;

        this
            .fg
            .controls['name']
            .valueChanges
            .debounceTime(500)
            .subscribe(name => {
                that.title = name;
                that.chartDefinition.title = undefined;
            });
    }

    private _chartToolTipFormatterProcess() {
        if (!this.chartDefinition) {
            return;
        }
        if (this.chartDefinition.tooltip && this.chartDefinition.tooltip.formatter) {

            const formatterFactory = new FormatterFactory();
            const formatterType = Object
                .prototype
                .toString
                .call(this.chartDefinition.tooltip.formatter);

            let formatter;
            if (formatterType !== '[object Function]') {

                formatter = formatterFactory.getFormatter(this.chartDefinition.tooltip.formatter, this.comparison);
            } else {

                formatter = this.chartDefinition.tooltip.formatter;
            }

            if (!formatter) {
                console.error('Formatter for ' + this.chartDefinition.tooltip.formatter + ' could not be found');
            } else {
                this.chartDefinition.tooltip.formatter = formatter.exec;
            }
        } else {

            if (this.chartDefinition.tooltip && this.chartDefinition.tooltip.custom) {
                const formatterFactory = new FormatterFactory();
                const formattercustom = formatterFactory.getFormatter(this.chartDefinition.tooltip.custom, this.comparison);
                this.chartDefinition.tooltip.formatter = formattercustom.exec;

            }

        }
    }

}
