import { BaseModel, ModelCreationResult } from '../../../guides/model-demo';
import { IChartDateRange } from '../../../shared/models/date-range';
import * as validate from 'validate.js';

export enum WidgetTypeEnum {
    Undefined,
    Numeric,
    Chart
}

export const WidgetTypeMap = {
    numeric: WidgetTypeEnum.Numeric,
    chart: WidgetTypeEnum.Chart
};

export function getWidgetTypePropName(type: WidgetTypeEnum) {
    switch (type) {
        case WidgetTypeEnum.Numeric:
            return 'numeric';
        case WidgetTypeEnum.Chart:
            return 'chart';
    }
}

export enum ComparisonDirectionArrowEnum {
    Undefined,
    None,
    Up,
    Down
}

export const ComparisonDirectionArrowMap = {
    none: ComparisonDirectionArrowEnum.None,
    up: ComparisonDirectionArrowEnum.Up,
    down: ComparisonDirectionArrowEnum.Down
};

export function getComparisonDirectionArrow(type: ComparisonDirectionArrowEnum) {
    switch (type) {
        case ComparisonDirectionArrowEnum.None:
            return 'none';
        case ComparisonDirectionArrowEnum.Up:
            return 'up';
        case ComparisonDirectionArrowEnum.Down:
            return 'down';
    }
}

export enum WidgetSizeEnum {
    Undefined,
    Small,
    Big
}

export const WidgetSizeMap = {
    small: WidgetSizeEnum.Small,
    big: WidgetSizeEnum.Big
};

export interface IChartWidgetAttributes {
    chart: string;
}

export interface INumericWidgetAttributes {
    kpi: string;
    dateRange: IChartDateRange;
    comparison?: string[];
    comparisonArrowDirection?: string;
    format?: string;
    trending?: string;
}

export interface IMaterializedComparison {
    period: string;
    value: number;
    arrowDirection?: string;
}

export interface IWidgetMaterializedFields {
    value?: number;
    comparison?: IMaterializedComparison;
    trending?: any;
    chart?: string;
}

export interface IWidget {
    _id?: any;
    order: number;
    name: string;
    description?: string;
    type: string;
    size: string;
    color: string;
    chartWidgetAttributes?: IChartWidgetAttributes;
    numericWidgetAttributes?: INumericWidgetAttributes;
    dashboards?: string[];
    hasAlerts?: boolean;

     // virtual properties ( result of calcs, chart definitions, trending)
    materialized?: IWidgetMaterializedFields;

    // preview
    preview?: boolean;
    tags?: string[];
}

export interface IWidgetInput {
    order: number;
    name: string;
    description?: string;
    type: string;
    size: string;
    color: string;
    numericWidgetAttributes?: INumericWidgetAttributes;
    chartWidgetAttributes?: IChartWidgetAttributes;
    dashboards?: string[];
}

export interface IWidgetFormGroupValues {
    order: string;
    name: string;
    description?: string;
    type: string;
    size: string;
    color: string;
    format?: string;

    // numeric attributes
    kpi?: string;
    predefinedDateRange?: string;
    customFrom?: string;
    customTo?: string;
    comparison?: string;
    comparisonArrowDirection?: string;

    // chart attributes
    chart?: string;
    dashboards?: string;
}

export interface ListWidgetsQueryResponse {
    listWidgets: IWidget[];
  }

export class WidgetModel extends BaseModel<IWidget> implements IWidget {
    _id?: any;
    order: number;
    name: string;
    description?: string;
    type: string;
    size: string;
    color: string;
    numericWidgetAttributes?: INumericWidgetAttributes;
    chartWidgetAttributes?: IChartWidgetAttributes;
    tags: string[];

    public static fromJson(json: string): WidgetModel {
        try {
            return new WidgetModel(JSON.parse(json));
        } catch (err) {
            return undefined;
        }
    }

    public static Create(entity: IWidget): ModelCreationResult<WidgetModel> {
        const preInstance = new WidgetModel(entity);
        const validationErrors = preInstance.validationErrors;

        return {
            instance: validationErrors.length > 0 ? null : preInstance,
            validationErrors: validationErrors
        };
    }

    toWidgetFormValues(): IWidgetFormGroupValues {
        return null;
    }

    validate(data: IWidget) {
        const constrains = {
            name: {
                presence: true
            },
            size: {
                presence: true,
            },
            type: {
                presence: true,
            }
        };

        this._validationErrors =  WidgetModel.fromValidateJS((<any>validate)(data, constrains, { fullMessages: false}));
    }

    private constructor(entity: IWidget) {
        super();
        this.validate(entity);
        if (this._validationErrors.length > 0) {
            return;
        }

        const that = this;

        Object.keys(entity).forEach(key => {
            if (entity[key]) {
                that[key] = entity[key];
            }
        });
    }

}
