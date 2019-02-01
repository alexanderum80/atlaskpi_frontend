import { Component, Input, Output, EventEmitter } from '@angular/core';
import { IFunnel } from '../shared/models/funnel.model';
import { IRenderedFunnel, IRenderedFunnelStage } from '../shared/models/rendered-funnel.model';
import { IClickedStageInfo } from '../shared/models/models';

@Component({
  selector: 'kpi-funnel-preview',
  templateUrl: './funnel-preview.component.pug',
  styleUrls: ['./funnel-preview.component.scss']
})
export class FunnelPreviewComponent {
    @Input() renderedFunnel: IRenderedFunnel;
    @Input() width = 400;
    @Input() height = 400;
    @Input() preview = false;
    @Output() stageClicked = new EventEmitter<IClickedStageInfo>();

    calcStageHeight(stage: IRenderedFunnelStage): number {
        const total = this.renderedFunnel.stages
          .map(s => s.amount)
          .reduce((prev, next) => (prev + next));

        return Math.round(stage.amount * this.height / total);
    }

    generateStageDescription(stage: IRenderedFunnelStage) {
      let description = stage.name;
      if (stage.compareToStageName) {
        const percent = stage.compareToStageValue === -1
          ? 'N/A'
          : `${stage.compareToStageValue}%`;

          description += ` ( ${percent} of ${stage.compareToStageName} )`;
      }

      return description;
    }

    emitStage($event: IRenderedFunnelStage) {
      if (this.preview) { return; }

      const stageInfo: IClickedStageInfo = {
        funnelId: this.renderedFunnel._id,
        stageId: $event._id,
        stageName: $event.name
      };

      this.stageClicked.emit(stageInfo);
    }



}
