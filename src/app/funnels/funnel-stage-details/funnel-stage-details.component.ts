import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { IClickedStageInfo } from '../shared/models/models';
import { AgGridNg2 } from '../../../../node_modules/ag-grid-angular';
import { ApolloService } from '../../shared/services/apollo.service';
import { AgGridService } from '../../shared/services';

const stageDetailsQuery = require('graphql-tag/loader!./funnel-stage-details.query.gql');
export interface IReportColumn {
  name: string;
  path: string;
  type: string;
}
export interface IReportResult {
  name?: string;
  columns: IReportColumn[];
  rows: string;
}



@Component({
  selector: 'kpi-funnel-stage-details',
  templateUrl: './funnel-stage-details.component.pug',
  styleUrls: ['./funnel-stage-details.component.scss']
})
export class FunnelStageDetailsComponent implements OnInit {
  @Input() stageInfoParams: IClickedStageInfo;
  @ViewChild('agGrid') agGrid: AgGridNg2;
  loading = true;

  dataSource = {
    columnDefs: [],
    rowData: []
  };

  private  defaultColDef = {
    resizable: true,
    sortable: true,
    filter: true
  };

  constructor(
    private _apolloService: ApolloService,
    private _agGridService: AgGridService,
  ) { }

  ngOnInit() {
    // setTimeout(() => {
    //   this.loading = false;
    // }, 1000);

    const variables = { funnelId: this.stageInfoParams.funnelId, stageId: this.stageInfoParams.stageId };

    this._apolloService.networkQuery<IReportResult>(stageDetailsQuery, variables )
      .then(data => {
          const { columns, rows } = data.funnelStageDetails as IReportResult;
          this.dataSource.columnDefs =
            this._agGridService.prepareColumns(columns, { replaceNullNumbersWithZero: true });
          this.dataSource.rowData = JSON.parse(rows);
          this.loading = false;
      });
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
