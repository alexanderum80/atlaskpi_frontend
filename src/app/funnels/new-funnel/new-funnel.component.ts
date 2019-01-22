import { Component, OnInit } from '@angular/core';
import { IFunnel } from '../shared/models/funnel.model';

@Component({
  selector: 'kpi-new-funnel',
  templateUrl: './new-funnel.component.pug',
  styleUrls: ['./new-funnel.component.scss']
})
export class NewFunnelComponent implements OnInit {

  testFunnel: IFunnel = {
    _id: '1',
    name: 'test',
    description: 'test',
    stages: [ {
      order: 1,
      name: 'uno'
    }]
  };

  constructor() { }

  ngOnInit() {
  }

}
