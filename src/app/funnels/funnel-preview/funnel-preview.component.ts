import { Component, Input, Output, EventEmitter } from '@angular/core';
import { IFunnel } from '../shared/models/funnel.model';
import { IRenderedFunnel, IRenderedFunnelStage } from '../shared/models/rendered-funnel.model';
import { IClickedStageInfo } from '../shared/models/models';
import { BrowserService } from '../../shared/services/browser.service';

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

    isMobile: boolean;

    private _lastClickTime = 0;

    constructor(
      private _browser: BrowserService,

    ) {
      this.isMobile = this._browser.isMobile();
      // this.isMobile = true;
    }

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

    onStageClicked(stage: IRenderedFunnelStage) {
      if (this.preview) { return; }

      if (!this.isMobile) {
        this.emitStage(stage);
        return;
      }

      if (!this._isDoubleClick()) { return; }

      this.emitStage(stage);

    }

    emitStage(stage: IRenderedFunnelStage) {
      const stageInfo: IClickedStageInfo = {
        funnelId: this.renderedFunnel._id,
        stageId: stage._id,
        stageName: stage.name
      };

      this.stageClicked.emit(stageInfo);
    }

    private _isDoubleClick(): boolean {
      if (this._lastClickTime === 0) {
        this._lastClickTime = new Date().getTime();
        return;
      }

      if (((new Date().getTime()) - this._lastClickTime) < 800) {
          this._lastClickTime = 0;
          return true;
      }

      this._lastClickTime = new Date().getTime();
    }

    funnelHeight() {
      return this.isMobile
        ? 320
        : this.height;
    }

    funnelWidth() {
      return this.isMobile
        ? 320
        : this.width;
    }



}
