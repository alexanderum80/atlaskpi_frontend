import { Component, Input, OnInit } from '@angular/core';
import { KPILogicOperatorCollection } from '../../../../shared/domain/kpis/operators';
import { isEmpty } from 'lodash';

@Component({
  selector: 'kpi-chart-detail-filter',
  templateUrl: './chart-detail-filter.component.pug',
  styleUrls: ['./chart-detail-filter.component.scss']
})
export class ChartDetailFilterComponent implements OnInit {
  @Input() item: any;

  filterSource: string;
  filterOperator: string;
  filterValue: string;

  constructor() { }

  ngOnInit() {
    const operators: string[] = [ 'eq', 'ne', 'gte', 'lte' ];
    const that = this;

    if (isEmpty(this.item)) {
      return;
    }

    Object.keys(this.item).forEach(key => {
      const source = key.replace(/__dot__/g, ' ').replace('.', ' ');
      that.filterSource = source.substr(0, 1).toUpperCase() + source.substr(1, source.length - 1);

      let dollarKey = '';

      const filterSourceObject = that.item[key];
      const filterSourceKey: string[] = Object.keys(filterSourceObject);

      if (Array.isArray(filterSourceKey)) {
        dollarKey = filterSourceKey[0];
      }

      const filterObject = filterSourceObject[dollarKey];
      that.filterValue = Array.isArray(filterObject) ? filterObject.join(', ') : filterObject;

      that.filterOperator = dollarKey.replace('__dollar__', '').replace('$', '');
      const operator = KPILogicOperatorCollection.find(o => o.symbol === that.filterOperator);

      if (operator && operators.indexOf(operator.symbol) !== -1) {
        that.filterOperator = that.filterOperator + ' to';
      }
    });
  }

}
