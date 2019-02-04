import { GenericSelectionService } from '../../shared/services/generic-selection.service';
import { SingleChartQuery } from '../shared/graphql';
import { Subscription } from 'apollo-client/util/Observable';
import { Apollo } from 'apollo-angular';
import { IChart } from '../shared/models';
import { Component, OnInit, Input, Output, OnDestroy, EventEmitter } from '@angular/core';
import { Chart } from 'angular-highcharts';
import { FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'kpi-auto-renderable-chart',
  templateUrl: './auto-renderable-chart.component.pug',
  styleUrls: ['./auto-renderable-chart.component.scss']
})
export class AutoRenderableChartComponent implements OnInit, OnDestroy {
  @Input() item: IChart;
  @Input() title: string;
  @Input() minHeight = 0;
  @Input() autoRender = true;
  @Input() placeholderImg;
  @Input() isFromDashboardEdit = false;

  chart: any; // Chart;
  loading = false;
  subscription: Subscription;
  chartSelected = false;
  selectionSubscription: Subscription;
  position = 0;
  fgChart: FormGroup;
  fgPatched = false;

  constructor(private _apollo: Apollo,
    private _selectionService: GenericSelectionService) { }

  ngOnInit() {
    if (!this.isFromDashboardEdit) { return; }
    this.fgChart = new FormGroup({
      'position': new FormControl(''),
    });
    if (this.autoRender) { this._queryChart(); }
    this.selectionSubscription = this._selectionService.selection$.subscribe(selectedItems => {
      const exist = selectedItems.find(i => i.id === this.item._id && i.type === 'chart');
      if (exist) {
        const fgValue = {
          position: exist.position
        };
        if (!this.fgPatched) {
          this.fgChart.patchValue(fgValue);
          this.fgPatched = true;
        }
        this.chartSelected = true;
        if (exist.position === 0) {
          this.fgChart.controls['position'].setErrors({invalidDataType: true});
        } else {
          if (!exist.validPosition) {
            this.fgChart.controls['position'].setErrors({forbiddenName: true});
          } else {
            this.fgChart.controls['position'].setErrors(null);
          }
        }
      } else {
        this.chartSelected = false;
      }
   });
   this.fgChart.valueChanges.subscribe(value => {
    if (isNaN(value.position) || value.position === '') {
      this.changePosition(0);
    } else {
      if (this.fgPatched) {
        this.changePosition(value.position);
      } else {
        this.fgPatched = true;
      }
    }
   });
  }

  previewChart() {
    this._queryChart();
  }

  changePosition(event) {
    const itemChange = { id: this.item._id, type: 'chart', position: parseInt(event, 0) };
    this._selectionService.updateItemPosition(itemChange);
  }

  itemPosition() {
    return this.position;
  }

  onClickPosition() {
    this._selectionService.allowDisableSelection = false;
  }

  private _queryChart() {

      if (this.chart || !this.item) {
          return;
      }

      this.loading = true;

      const that = this;
      this._apollo.query<{ chart: string }> ({
          query: SingleChartQuery,
          variables: {
            id: this.item._id
          },
          fetchPolicy: 'network-only'
        })
        .toPromise()
        .then(response => {
            that.loading = false;
            const chart = JSON.parse(response.data.chart);
            chart.chartDefinition = that._simplifyChartDefinition(chart.chartDefinition);
            that.chart = new Chart(chart.chartDefinition);

              that.subscription = that.chart.ref$.subscribe(ref => {
                setTimeout(() => {
                  /*
                    known highchart error:
                    https://github.com/pablojim/highcharts-ng/issues/594

                  */
                    try {
                    ref.reflow();
                    } catch (e) {
                      console.log('"HIghchart error: ', e);
                    }
                }, 0);
              });
      });
  }

  private _simplifyChartDefinition(definition: any) {
    definition.exporting = definition.exporting || { };
    definition.exporting.enabled = false;
    definition.credits = { enabled: false };
    definition.legend = { enabled: false };
    definition.tooltip = { enabled: false };
    definition.plotOptions = definition.plotOptions || {};
    definition.plotOptions.series = definition.plotOptions.series || {};
    definition.plotOptions.series.enableMouseTracking = false;
    definition.title = undefined;
    definition.subtitle = undefined;
    return definition;
  }

  get placeholderVisible() {
    return !this.loading && !this.chart && !this.autoRender;
  }

  get placeholderHeight() {
    return Math.floor((this.minHeight || 120));
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

}
