import * as Promise from 'bluebird';
import { isEmpty, map } from 'lodash';
import * as moment from 'moment';
import * as validate from 'validate.js';

import { ITarget } from '../targets.interface';

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

export class TargetModel extends BaseModel<ITarget> {
    private name;
    private datepicker;
    private vary;
    private amount;
    private amountBy;
    private period;
    private stackName;
    private visible;
    private notify;

    public static Create(target: ITarget) {
        const targetInstance = new TargetModel(<any>target);
        return targetInstance.validationErrors.length === 0 ? targetInstance : null;
    }

    public static CreateAsync(target: ITarget): Promise<any> {
        return new Promise((resolve, reject) => {
            const targetInstance = new TargetModel(<any>target);
            if (targetInstance.validationErrors.length === 0) {
                resolve(targetInstance);
                return;
            }
            resolve(null);
        });
    }

    private constructor(target: ITarget) {
        super();
        this.validate(target);

        if (this._validationErrors) {
            this._patchInstanceVariables(target);
        }
    }

    protected validate(target: ITarget) {

        const _amount = target.amount.toString();

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

        (<any>validate).validators.pastDate = function(value, options, key, attributes) {
                const isPastDate = moment(options.date).isBefore(moment.utc().format('MM/DD/YYYY'));
                if (isPastDate) {
                    return 'cannot set past dates';
                }
        };

        // (<any>validate).validators.fixedPercent = function(value, options, key, attributes) {
        //         if (options.vary === 'fixed' && options.amountBy === 'percent') {
        //             return 'cannot set to percent when your target is a hit';
        //         }
        // };

        (<any>validate).validators.formatAmount = function(value, options, key, attributes) {
                if (options.amount.toString().match(/^(?:\d*\.\d{1,2}|\d+)$/) === null) {
                    return 'i.e. 10 or 10.5 or 10.58';
                }
        };

        // (<any>validate).validators.amountCheckVary = function(value, options, key, attributes) {
        //         if (!_.isEmpty(options.amount) &&
        //             options.vary.match(/increase|decrease/i) &&
        //             options.amountBy.match(/percent/i) &&
        //             (parseFloat(options.amount) < 1 || parseFloat(options.amount) > 100)) {
        //                 return 'must be between 0-100 when select percent';
        //             }
        // };

        // (<any>validate).validators.hitTargetPercentCheck = function(value, options, key, attributes) {
        //         if (options.vary.match(/fixed|hit/i) &&
        //             options.amountBy.match(/percent/i)) {
        //                 return 'cannot be percent when target is hit';
        //             }
        // };

        (<any>validate).validators.hitAmountByCheck = function(value, options, key, attributes) {
                if (!isEmpty(options.vary) &&
                    options.vary.match(/increase|decrease/i) &&
                    isEmpty(options.amountBy)) {
                        return 'must select amountBy value when not hit';
                    }
        };

        const constraints = {
            name: {
                presence: { message: 'cannot be blank' },
                checkName: {
                    name: target.name
                }
            },
            amount: {
                presence: { message: '^cannot be blank' },
                numericality: {
                    onlyInteger: true,
                    greaterThan: 0
                },
                formatAmount: {
                    amount: target.amount
                },
                amountCheckVary: {
                    amount: target.amount,
                    vary: target.vary,
                    amountBy: target.amountBy
                }
            },
            amountBy: {
                presence: { message: '^cannot be blank' },
                fixedPercent: {
                    vary: target.vary,
                    amountBy: target.amountBy
                },
                hitTargetPercentCheck: {
                    vary: target.vary,
                    amountBy: target.amountBy
                },
                hitAmountByCheck: {
                    vary: target.vary,
                    amountBy: target.amountBy
                }
            },
            vary: {
                presence: { message: '^cannot be blank' }
            },
            datepicker: {
                presence: { message: '^cannot be blank' },
                formatDate: {
                    date: target.datepicker
                },
                pastDate: {
                    date: target.datepicker
                }
            },
            notify: { presence: { message: '^cannot be blank'} },
            visible: { presence: { message: '^cannot be blank' } }
        };

        const errors = (<any>validate)((<any>target), constraints, { fullMessages: false});

        if (errors) {
            map(errors, (value, key) => {
                this._validationErrors.push({
                    field: key,
                    errors: value
                });
            });
        }
    }

    private _patchInstanceVariables(target: any) {
        for (const i in target) {
            if (i) {
                this[i] = target[i];
            }
        }
    }
}
