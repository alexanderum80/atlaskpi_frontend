import { FormGroup } from '@angular/forms';
import { Component, Input, OnInit, EventEmitter } from '@angular/core';
import { ChartGalleryService } from '../../services';
import { IChartGalleryItem } from '../../models';

@Component({
  selector: 'kpi-chart-type',
  templateUrl: './chart-type.component.pug',
  styleUrls: ['./chart-type.component.scss']
})
export class ChartTypeComponent implements OnInit {
    @Input() fg: FormGroup;
    @Input() chartType: string;

    showing = false;

    constructor(private _chartGalleryService: ChartGalleryService) { }

    ngOnInit() {
       const that = this;
        this._chartGalleryService.activeChart$.subscribe((chart) => {
          that.chartType = String(chart.type);
          that.showing = false;
        });
    }

    toggle() {
      if (!this.showing) {
        return this._show();
      }
      return this._hide();
    }

    get chartTypeButtonTitle(): string {
        if (!this.chartType) { return 'Chart Type'; }
        return this.chartType = String(this.chartType) === 'others' ? 'map' : String(this.chartType);
    }

    private _show() {
      this.showing = true;
    }

    private _hide() {
      this.showing = false;
    }

}
