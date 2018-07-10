import { IEmployee } from '../../employees/shared/models/employee.model';
import { Component, Input, OnInit } from '@angular/core';
import { IAmounts } from '../shared/models/activity-models';

@Component({
  selector: 'kpi-top-employee-activity',
  templateUrl: './top-employee-activity.component.pug',
  styleUrls: ['./top-employee-activity.component.scss']
})
export class TopEmployeeActivityComponent implements OnInit {
  @Input() sales: IAmounts;
  @Input() startDayDate: Date;

  viewDetails = false;
  fullName: string;

  ngOnInit() {
    this.fullName = this.sales[0].employee;
  }

  public showDetails() {
    this.viewDetails = true;
  }

  public hideDetails() {
    this.viewDetails = false;
  }

  get initials(): string {
    if (!this.fullName) {
        return null;
    }
    const chunks = this.fullName.split(' ');
    if (!chunks) {
        return this.fullName.substr(0, 1).toUpperCase();
    }
    return chunks.map(c => {
        return c.substr(0, 1).toUpperCase();
    }).join('');
  }

}
