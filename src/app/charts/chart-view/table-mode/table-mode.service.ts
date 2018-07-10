import { Chart } from 'angular-highcharts';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

export interface ITableModeData {
  frequency: string;
  groupings: string|string[];
}

@Injectable()
export class TableModeService {
  private _tableModeData: ITableModeData;
  private _tableModeDataSubject: BehaviorSubject<ITableModeData> = new BehaviorSubject<ITableModeData>(this._tableModeData);

  private _chart: Chart;
  private _chartSubject: BehaviorSubject<Chart> = new BehaviorSubject<Chart>(this._chart);

  setTableModeData(data: ITableModeData): void {
    if (!data) { return; }
    this._tableModeData = data;
    this._tableModeDataSubject.next(this._tableModeData);
  }

  setChart(chart: Chart): void {
    if (!chart) { return; }
    this._chart = chart;
    this._chartSubject.next(this._chart);
  }

  get tableModeData$(): Observable<ITableModeData> {
    return this._tableModeDataSubject.asObservable().distinctUntilChanged();
  }

  get chart$(): Observable<Chart> {
    return this._chartSubject.asObservable().distinctUntilChanged();
  }

}
