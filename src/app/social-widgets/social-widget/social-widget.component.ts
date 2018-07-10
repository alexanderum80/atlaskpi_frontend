import { Component, Input } from '@angular/core';

import { SocialWidgetBase } from '../models/social-widget-base';

@Component({
  selector: 'kpi-social-widget',
  templateUrl: './social-widget.component.pug',
  styleUrls: ['./social-widget.component.scss'],
})
export class SocialWidgetComponent {
  @Input() socialWidget: SocialWidgetBase;

  mainValue(): string {
    return Number(this.socialWidget.value).toLocaleString();
  }

  historicalValue(): string {
    if (!this.socialWidget.historicalData) { return; }
    return Number(this.socialWidget.historicalData.value).toLocaleString();
  }

  arrow(): string {
      if (!this.socialWidget.historicalData ||
          this.socialWidget.value === this.socialWidget.historicalData.value)  {
        return;
      }

      return Number(this.socialWidget.value) > Number(this.socialWidget.historicalData.value)
             ? 'up'
             : 'down';
  }

  hasValue(): boolean {
    return this.socialWidget.value !== null;
  }
}
