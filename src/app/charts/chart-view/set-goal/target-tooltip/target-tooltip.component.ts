import { FormGroup } from '@angular/forms';
import { SelectionItem } from '../../../../ng-material-components';
import { AfterViewInit, Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'kpi-target-tooltip',
  templateUrl: './target-tooltip.component.pug',
  styleUrls: ['./target-tooltip.component.scss']
})
export class TargetTooltipComponent implements OnInit, AfterViewInit {
  @Output() closeToolTip = new EventEmitter<boolean>();

  fg: FormGroup = new FormGroup({});
  chartItems: SelectionItem[] = [{
    id: 'spa-location',
    title: 'Spa Location',
    selected: true,
    disabled: true
  }];
  chartTargetUnit: SelectionItem[] = [{
    id: 'percent', title: '%',
    selected: true,
    disabled: false
  }];
  chartGoalItems: SelectionItem[] = [{
    id: 'increase', title: 'Increase',
    selected: true, disabled: true
  }];

  chartPeriod: SelectionItem[] = [{
    id: 'last year', title: 'Last Year', selected: true, disabled: false
  }];

  constructor() { }

  ngOnInit() { }

  ngAfterViewInit() {
    this.fg.controls['targetEndDate'].setValue('12/31/2017');
    this.fg.controls['targetName'].setValue('Miami Sales Target');
  }

  toolTipClose() {
    this.closeToolTip.emit(false);
  }

}
