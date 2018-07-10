import { Component, Input, OnInit } from '@angular/core';
import { IResultGroup } from '../shared/models/result-groups';

@Component({
  selector: 'kpi-result-details',
  templateUrl: './result-details.component.pug',
  styleUrls: ['./result-details.component.scss']
})
export class ResultDetailsComponent implements OnInit {
  @Input() resultGroups: IResultGroup[];

  constructor() { }

  ngOnInit() {
  }

}
