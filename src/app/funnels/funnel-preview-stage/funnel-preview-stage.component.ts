import { Component, OnInit, Input } from '@angular/core';
import { IRenderedFunnelStage } from '../shared/models/rendered-funnel.model';

@Component({
  selector: 'kpi-funnel-preview-stage',
  templateUrl: './funnel-preview-stage.component.pug',
  styleUrls: ['./funnel-preview-stage.component.scss']
})
export class FunnelPreviewStageComponent {
    @Input() stage: IRenderedFunnelStage;

    get formattedAmount(): string {
      return this.stage.amount.toLocaleString();
    }
}
