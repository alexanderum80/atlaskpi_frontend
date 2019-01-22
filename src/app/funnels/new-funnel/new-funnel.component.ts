import { Component, OnInit } from '@angular/core';

import { IChartDateRange } from '../../shared/models';
import { Observable } from 'rxjs';
import { FunnelService } from '../shared/services/funnel.service';

@Component({
  selector: 'kpi-new-funnel',
  templateUrl: './new-funnel.component.pug',
  styleUrls: ['./new-funnel.component.scss']
})
export class NewFunnelComponent implements OnInit {

  ready$: Observable<boolean>;

  constructor(
    private funnelService: FunnelService
  ) { }

  ngOnInit() {
    this.ready$ = this.funnelService.loadDependencies$();
  }

}
