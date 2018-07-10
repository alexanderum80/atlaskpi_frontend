import { Component, Input, OnInit } from '@angular/core';
import { IResultGroup } from '../shared/models/result-groups';

@Component({
  selector: 'kpi-result-groups',
  templateUrl: './result-groups.component.pug',
  styleUrls: ['./result-groups.component.scss']
})
export class ResultGroupsComponent {
  @Input() resultGroups: IResultGroup[];

  toggle(g: IResultGroup) {
    g.enabled = !g.enabled;
  }

}
