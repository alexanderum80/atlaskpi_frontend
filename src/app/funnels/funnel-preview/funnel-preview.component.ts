import { Component, OnInit, Input } from '@angular/core';
import { IFunnel } from '../shared/models/funnel.model';
import { IRenderedFunnel, IRenderedFunnelStage } from '../shared/models/rendered-funnel.model';

@Component({
  selector: 'kpi-funnel-preview',
  templateUrl: './funnel-preview.component.pug',
  styleUrls: ['./funnel-preview.component.scss']
})
export class FunnelPreviewComponent implements OnInit {
    @Input() renderedFunnel: IRenderedFunnel;
    @Input() width = 400;
    @Input() height = 400;
    @Input() preview = false;

    constructor() { }

    ngOnInit() {
    }

    calcStageHeight(stage: IRenderedFunnelStage): number {
        const total = this.renderedFunnel.stages
          .map(s => s.amount)
          .reduce((prev, next) => (prev + next));

        return Math.round(stage.amount * this.height / total);
    }

    generateStageDescription(stage: IRenderedFunnelStage) {
      let description = stage.name;
      if (stage.compareToStageName && stage.compareToStageValue) {
        description += ` ( ${stage.compareToStageValue}% of ${stage.compareToStageName} )`;
      }

      return description;
    }



}
