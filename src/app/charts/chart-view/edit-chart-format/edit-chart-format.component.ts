import { ChartData } from '../chart-view.component';
import { MenuItem } from '../../../ng-material-components';
import { FormGroup } from '@angular/forms';
import { DialogResult } from '../../../shared/models/dialog-result';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'kpi-edit-chart-format',
  templateUrl: './edit-chart-format.component.pug',
  styleUrls: ['./edit-chart-format.component.scss']
})
export class EditChartFormatComponent implements OnInit {
  @Input() chartData: ChartData;
  @Output() done = new EventEmitter<DialogResult>();

  fg: FormGroup = new FormGroup({});
  targets: MenuItem[];

  chartType: MenuItem[] = [
    {
      id: 'area', title: 'Area'
    },
    {
      id: 'line', title: 'Line'
    },
    {
      id: 'column', title: 'Column'
    }
  ];

  frequencies: MenuItem[] = [
    {
      id: 'daily', title: 'Daily'
    },
    {
      id: 'weekly', title: 'Weekly'
    },
    {
      id: 'monthly', title: 'Monthly'
    },
    {
      id: 'quarterly', title: 'Quartely'
    },
    {
      id: 'yearly', title: 'Yearly'
    }
  ]

  constructor() { }

  ngOnInit() {
  }

  preview() {
    this.done.emit(DialogResult.PREVIEW);
  }

  save() {
    this.done.emit(DialogResult.SAVE);
  }

  cancel() {
    this.done.emit(DialogResult.CANCEL);
  }

}
