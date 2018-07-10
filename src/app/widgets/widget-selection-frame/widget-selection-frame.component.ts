import { MenuItem } from '../../ng-material-components';
import { IWidget } from './../shared/models/widget.models';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

const entranceEffect = 'fadeIn';
const exitEffect = 'fadeOut';

@Component({
  selector: 'kpi-widget-selection-frame',
  templateUrl: './widget-selection-frame.component.pug',
  styleUrls: ['./widget-selection-frame.component.scss']
})
export class WidgetSelectionFrameComponent {
  @Input() widget: IWidget;
  @Output() actionClicked = new EventEmitter<MenuItem>();

  constructor() { }

  onActionClicked(item: MenuItem) {
    item['payload'] = { id: this.widget._id };
    this.actionClicked.emit(item);
  }

}
