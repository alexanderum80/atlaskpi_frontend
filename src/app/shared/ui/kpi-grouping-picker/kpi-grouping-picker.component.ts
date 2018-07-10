import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { SelectionItem } from '../../../ng-material-components';

@Component({
  selector: 'kpi-kpi-grouping-picker',
  templateUrl: './kpi-grouping-picker.component.pug',
  styleUrls: ['./kpi-grouping-picker.component.scss']
})
export class KpiGroupingPickerComponent implements OnInit {
  @Input() fg: FormGroup;
  @Input() groupingList: SelectionItem[] = [];
  @Input() icon = 'group-work';

  ngOnInit() {
  }

}
