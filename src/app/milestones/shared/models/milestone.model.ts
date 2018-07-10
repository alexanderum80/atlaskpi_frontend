import { IMilestone } from '../milestones.interface';
import * as Promise from 'bluebird';
import * as moment from 'moment';
import { map } from 'lodash';
import * as validate from 'validate.js';

export interface IValidationError {
    field: string;
    errors: string[];
}

/**
 * Abstract Model definition for all application models
 *
 */
export abstract class BaseModel<T> {
    protected _validationErrors: IValidationError[] = [];
    protected get validationErrors(): IValidationError[] { return this._validationErrors; }

    public static Create(data: any) { throw new Error('Method not implemented'); };
    public static CreateAsync(data: any): Promise<any> { throw new Error('Method not implemented'); };

    constructor() { }

    /**
     * This method should ALWAYS be called from the constructor of the chil class to validate the information
     * In addition this method should update the instance variable _validationErrors property
     * @param data data to validate
     */
    protected abstract validate(data: T);
}

export class MilestoneModel extends BaseModel<IMilestone> {
    private _id;
    private task;
    private target;
    private dueDate;
    private responsible;

    public static Create(milestone: IMilestone) {
        const targetInstance = new MilestoneModel(<any>milestone);
        return targetInstance.validationErrors.length === 0 ? targetInstance : null;
    }

    public static CreateAsync(milestone: IMilestone): Promise<any> {
        return new Promise((resolve, reject) => {
            const targetInstance = new MilestoneModel(<any>milestone);
            if (targetInstance.validationErrors.length === 0) {
                resolve(targetInstance);
                return;
            }
            resolve(null);
        });
    }

    private constructor(milestone: IMilestone) {
        super();
        this.validate(milestone);

        if (this._validationErrors) {
            this._patchInstanceVariables(milestone);
        }
    }

    protected validate(milestone: IMilestone) {

        const _task = milestone.task.toString();

        (<any>validate).validators.checkName = function(value, options, key, attributes) {
            const isLettersOnly = options.name.match(/[a-z]+\s?[a-z]/) === null;
            if (isLettersOnly) {
                return 'must contain letters and space only';
            }
        };

        (<any>validate).validators.formatDate = function(value, options, key, attributes) {
                const isDateFormattted = moment(options.date, 'MM/DD/YYYY', true).isValid() === false;
                if (isDateFormattted) {
                    return 'must be in MM/DD/YYYY format';
                }
        };

        const constraints = {
            name: {
                presence: { message: 'cannot be blank' },
                checkName: {
                    name: milestone.task
                }
            },
            vary: {
                presence: { message: '^cannot be blank' }
            },
            datepicker: {
                presence: { message: '^cannot be blank' },
                formatDate: {
                    date: milestone.dueDate
                },
            },
            notify: { presence: { message: '^cannot be blank'} },
            visible: { presence: { message: '^cannot be blank' } }
        };

        const errors = (<any>validate)((<any>milestone), constraints, { fullMessages: false});
        console.log(errors);
        if (errors) {
            map(errors, (value, key) => {
                this._validationErrors.push({
                    field: key,
                    errors: value
                });
            });
        }
    }

    private _patchInstanceVariables(milestone: any) {
        for (const i in milestone) {
            if (i) {
                this[i] = milestone[i];
            }
        }
    }
}