import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Apollo } from 'apollo-angular';
import { ListChartService } from '../../charts/shared';
import { Subscription } from 'rxjs/Subscription';
import { ILegendColorConfig } from '../show-map/show-map.component';
import { inject } from 'async';

@Component({
  selector: 'kpi-map-view-mini',
  templateUrl: './map-view-mini.component.pug',
  styleUrls: ['./map-view-mini.component.scss']
})
export class MapViewMiniComponent implements OnInit, OnDestroy {
    @Input() item: any;
    @Input() title: string;
    @Input() legendColors: ILegendColorConfig[];
    @Input() allowSelected = true;
    @Input() padded = true;
    //hiding this until fully functional    
    @Input() showSettingsBtn = false;
    @Input() showLegendBtn = true;
    @Input() Height: string = '400px';

    selected$: Observable<any>;
    inspectorOpen$: Observable<boolean>;

    chart: any;

    loading = false;
  constructor(private _listChartService: ListChartService) { }

  ngOnInit() {
    this.selected$ = this._listChartService.selected$;
    this.inspectorOpen$ = this._listChartService.inspectorOpen$;
  }
  ngOnDestroy() {
    // CommonService.unsubscribe(this._subscription);
  }

  setActive() {
    this._listChartService.setActive(this.item);
    this._listChartService.showInspector();
  }

}
