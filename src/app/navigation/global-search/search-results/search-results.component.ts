import { Component, Input, OnInit } from '@angular/core';
import { IResultGroup } from '../shared/models/result-groups';

@Component({
  selector: 'kpi-search-results',
  templateUrl: './search-results.component.pug',
  styleUrls: ['./search-results.component.scss'],
})
export class SearchResultsComponent {
  @Input() resultGroups: IResultGroup[];
}
