import { IMutationResponse } from '../../../shared/models';
export interface IStartingFrom {
  id: string;
  title: string;
}

export interface IPeriodPredict {
  id: string;
  title: string;
  frequency: string;
}

export interface IChartRunRate {
  _id: string;
  name: string;
  description: string;
  chart: string;
  startingFrom: string;
  periodPredict: string;
  title: string;
  frequency: string;
}


export interface ListChartsQueryResponse {
  listCharts: {
      data: IChartRunRate[]
  };
};

export interface DateRange {
  from: string;
  to: string;
}

export interface IChartRunRateVariable {
  id: string;
  dateRange: DateRange;
  frequency; string;
}

export interface ISaveChartRunRateResponse {
  createChartRunRate: IMutationResponse ;
}


export interface EditChartRunRateResponse {
  chart: string;
}

export class ChartRunRate implements IChartRunRate {
  private __id: string;
  get _id(): string{ return this.__id; }

  private _name: string;
  get name(): string{ return this._name; }

  private _description: string;
  get description(): string{ return this._description; }

  private _chart: string;
  get chart(): string { return this._chart; }

  private _startingFrom: string;
  get startingFrom(): string { return this._startingFrom; }

  private _periodPredict: string;
  get periodPredict(): string { return this._periodPredict; }

  private _title: string;
  get title(): string { return this._title; }

  private _frequency: string;
  get frequency(): string { return this._frequency; }


  static Create(id: string, name: string,  description: string, chart: string, startingFrom: string,
    periodPredict: string,  title: string, frequency: string): IChartRunRate {
      const instance = new ChartRunRate(id, name, description, chart, startingFrom, periodPredict, title, frequency);
      return instance.name ? instance : null;
  }

  private constructor(id: string, name: string,  description: string, chart: string, startingFrom: string,
    periodPredict: string,  title: string,  frequency: string) {
      if (!name || !chart || !startingFrom || !periodPredict || !title || !frequency  ) {
          return;
      }
      this.__id = id;
      this._name = name;
      this._description = description;
      this._startingFrom = startingFrom;
      this._periodPredict = periodPredict;
      this._chart = chart;
      this._title = title;
      this._frequency = frequency;
  }
}


