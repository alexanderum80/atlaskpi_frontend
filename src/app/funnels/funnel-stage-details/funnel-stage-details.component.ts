import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { IClickedStageInfo } from '../shared/models/models';
import { AgGridNg2 } from '../../../../node_modules/ag-grid-angular';

@Component({
  selector: 'kpi-funnel-stage-details',
  templateUrl: './funnel-stage-details.component.pug',
  styleUrls: ['./funnel-stage-details.component.scss']
})
export class FunnelStageDetailsComponent implements OnInit {
  @Input() stageInfoParams: IClickedStageInfo;
  @ViewChild('agGrid') agGrid: AgGridNg2;
  loading = true;

  mockData = {
    columnDefs: [
      {headerName: 'Make', field: 'make' },
      {headerName: 'Model', field: 'model' },
      {headerName: 'Price', field: 'price'}
    ],
    rowData: [
        { make: 'Toyota', model: 'Celica', price: 35000 },
        { make: 'Ford', model: 'Mondeo', price: 32000 },
        { make: 'Porsche', model: 'Boxter', price: 72000 }
    ]
  };

  constructor() { }

  ngOnInit() {
    setTimeout(() => {
      this.loading = false;
    }, 1000);
  }

  export() {
    this.agGrid.api.exportDataAsCsv(
      {
        skipHeader: false,
        skipFooters: true,
        skipGroups: true,
        fileName: `${this.stageInfoParams.stageName}.csv`
      }
    );
  }


}
