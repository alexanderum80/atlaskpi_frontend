import { OnInit } from '@angular/core';
import { WidgetViewViewModel } from './widget-view.viewmodel';
import { IWidgetViewData } from '../shared/models/widget';
import { Component, Input, SimpleChanges, OnChanges } from '@angular/core';

@Component({
  selector: 'kpi-widget-view',
  templateUrl: './widget-view.component.pug',
  styleUrls: ['./widget-view.component.scss'],
  providers: [WidgetViewViewModel]
})
export class WidgetViewComponent implements OnChanges {
  @Input() widgetViewData: IWidgetViewData;

  constructor(public vm: WidgetViewViewModel) {
    this.vm.initialize(null);
  }

  ngOnChanges(changes: SimpleChanges) {
    this.vm.updateViewModel(changes['widgetViewData'].currentValue);
  }

  onActionClicked(value: any): void {
    if (this.vm.showDescription) {
      this.vm.showDescription = false;
      this.vm.descriptionAnimation = 'fadeOut';
    } else {
      this.vm.showDescription = true;
      this.vm.descriptionAnimation = 'fadeIn';
    }
  }
}

