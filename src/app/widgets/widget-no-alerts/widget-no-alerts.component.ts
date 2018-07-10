import { MenuItem } from '../../ng-material-components';
import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'kpi-widget-no-alerts',
  templateUrl: './widget-no-alerts.component.pug',
  styleUrls: ['./widget-no-alerts.component.scss']
})
export class WidgetNoAlertsComponent {
  @Output() done: EventEmitter<MenuItem> = new EventEmitter<MenuItem>();

  addAlert(): void {
    this.done.emit({ id: 'add' });
  }

}
