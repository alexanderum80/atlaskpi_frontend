import { IValidationError } from './model-demo';
import * as Promise from 'bluebird';

export interface IValidationError {
    field: string;
    errors: string[];
}

export interface ModelCreationResult<T> {
    instance: T;
    validationErrors: IValidationError[];
}

/**
 * Abstract Model definition for all application models
 *
 */
export abstract class BaseModel<T> {
    protected _validationErrors: IValidationError[];
    protected get validationErrors(): IValidationError[] { return this._validationErrors; }

    protected static fromValidateJS(validateJSErrors: any): IValidationError[] {
        const errors = [];
        if (!validateJSErrors) {
            return errors;
        }
        Object.keys(validateJSErrors).forEach((key) => {
            const error = {
                field: key,
                errors: validateJSErrors[key]
            };
            errors.push(error);
        });
        return errors;
    }

    public static Create(data: any): ModelCreationResult<any> { throw new Error('Method not implemented'); };
    public static CreateAsync(data: any): Promise<ModelCreationResult<any>> { throw new Error('Method not implemented'); };

    constructor() { }

    /**
     * This method should ALWAYS be called from the constructor of the chil class to validate the information
     * In addition this method should update the instance variable _validationErrors property
     * @param data data to validate
     */
    protected abstract validate(data: T);

}





export enum ChartTypeEnum {
    Area,
    Bar,
    Column,
    Line,
    Pie
}

export interface IChartModel {
    chartType: ChartTypeEnum;
    name: string;
    description: string;
    xAxisTitle: string;
    yAxisTitle: string;
}




/**
 * Chart Model Representation
 */
// export class ChartModel extends BaseModel<IChartModel> {

//     private _chartType: ChartTypeEnum;

//     // basic
//     private _name: string;
//     private _description: string;

//     // format
//     private _xAxisTitle: string;
//     private _yAxisTitle: string;

//     public static Create(chart: IChartModel) {
//         const chartInstance = new ChartModel(<any>{});

//         return chartInstance.validationErrors.length === 0 ? chartInstance : null;
//     }

//     private constructor(chart: IChartModel) {
//         super();
//         this.validate(chart);
//     }

//     protected validate(chart: IChartModel) {
//         // add validation rules here
//         this._validationErrors = [
//             { field: 'name', errors: [ 'cannot be empty' ]}
//         ];
//     }

// }


