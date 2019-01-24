import { Component, OnInit } from '@angular/core';

import { Observable } from 'rxjs';
import { FunnelService } from '../shared/services/funnel.service';
import { IFunnel } from '../shared/models/funnel.model';
import { IRenderedFunnel } from '../shared/models/rendered-funnel.model';

@Component({
  selector: 'kpi-new-funnel',
  templateUrl: './new-funnel.component.pug',
  styleUrls: ['./new-funnel.component.scss']
})
export class NewFunnelComponent implements OnInit {
  funnelModel: IFunnel = {
      name: '',
      stages: [ ]
  };

  ready$: Observable<boolean>;

  renderedFunnel$: Observable<IRenderedFunnel>;

  constructor(
      private funnelService: FunnelService
  ) {
  }


  ngOnInit() {
      this.ready$ = this.funnelService.loadDependencies$();
      this.funnelService.funnelModel = this.funnelModel;
      this.renderedFunnel$ = this.funnelService.renderedFunnelModel$;
  }

}
