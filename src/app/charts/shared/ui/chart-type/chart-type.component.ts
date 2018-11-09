import { FormGroup } from '@angular/forms';
import { Component, Input, OnInit } from '@angular/core';
import { ChartGalleryService } from '../../services';
import SweetAlert from 'sweetalert2';

@Component({
  selector: 'kpi-chart-type',
  templateUrl: './chart-type.component.pug',
  styleUrls: ['./chart-type.component.scss']
})
export class ChartTypeComponent implements OnInit {
    @Input() fg: FormGroup;
    @Input() chartType: string;
    @Input() isnewChartOrMap = true;

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
      if (!this.isnewChartOrMap && this.chartType === 'map') {
        SweetAlert({
          type: 'info',
          title: 'Edit map',
          text: 'Its not allow to change the type chart of map.'
      });
        return this._hide();
      } else if (!this.isnewChartOrMap && this.chartType !== 'map') {
        this._chartGalleryService.showMap = false;
      }
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
