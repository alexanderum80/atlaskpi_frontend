import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Apollo } from 'apollo-angular';
import { ListChartService } from '../../charts/shared';
import { Subscription } from 'rxjs/Subscription';
import { ILegendColorConfig } from '../show-map/show-map.component';

@Component({
  selector: 'kpi-map-view-big',
  templateUrl: './map-view-big.component.pug',
  styleUrls: ['./map-view-big.component.scss']
})
export class MapViewBigComponent implements OnInit {
    @Input() item: any;
    @Input() title: string;
    @Input() legendColors: ILegendColorConfig[];
    @Input() allowSelected = true;

    selected$: Observable<any>;
    inspectorOpen$: Observable<boolean>;

    chart: any;

    loading = false;
  constructor(private _listChartService: ListChartService) { }

  ngOnInit() {
    this.selected$ = this._listChartService.selected$;
    this.inspectorOpen$ = this._listChartService.inspectorOpen$;
  }

  setActive() {
    this._listChartService.setActive(this.item);
    this._listChartService.showInspector();
  }

}
