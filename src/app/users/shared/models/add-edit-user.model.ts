import { IUserInfo } from '../../../shared/models';
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

    public static Create(data: any) { throw new Error('Method not implemented'); }
    public static CreateAsync(data: any): Promise<any> { throw new Error('Method not implemented'); }

    constructor() { }

    /**
     * This method should ALWAYS be called from the constructor of the chil class to validate the information
     * In addition this method should update the instance variable _validationErrors property
     * @param data data to validate
     */
    protected abstract validate(data: T);
}

export class AddEditModel extends BaseModel<any> {
    private _id?: string;
    private firstName: string;
    private lastName: string;
    private email: string;
    private timezone?: string;
    private roles?: any;

    static Create(user: any) {
        const userInstance = new AddEditModel(user);
        return userInstance.validationErrors.length === 0 ? userInstance : null;
    }

    static CreateAsync(user: any) {
        return new Promise((resolve, reject) => {
            const userInstance = new AddEditModel(user);
            if (userInstance.validationErrors.length === 0) {
                resolve(userInstance);
                return;
            }
            resolve(null);
        });
    }

    private constructor(role: any) {
        super();
        this.validate(role);

        if (this._validationErrors) {
            this._patchInstanceVariables(role);
        }
    }

    public ToFormGroup() {
        if (this._validationErrors && this._validationErrors.length) {
            return null;
        }

        if (this._id) {
            return {
                id: this._id,
                data: {
                    firstName: this.firstName,
                    lastName: this.lastName,
                    email: this.email,
                    timezone: this.timezone,
                    roles: this.roles
                }
            };
        }
        return {
            firstName: this.firstName,
            lastName: this.lastName,
            email: this.email,
            timezone: this.timezone,
            roles: this.roles
        };
    }

    protected validate(user: any) {

        const constraints = {
            firstName: {
                presence: { message: 'cannot be blank'}
            },
            lastName: {
                presence: { message: 'cannot be blank'}
            },
            email: {
                presence: { message: 'cannot be blank' }
            },
            timezone: {
                presence: { message: 'cannot be blank' }
            },
            roles: {
                presence: { message: 'must select a role' }
            }
        };

        const errors = (<any>validate)((<any>user), constraints, { fullMessages: false} );

        if (errors) {
            map(errors, (value, key) => {
                this._validationErrors.push({
                    field: key,
                    errors: value
                });
            });
        }
    }

    private _patchInstanceVariables(role: any) {
        for (const i in role) {
            if (i) {
                this[i] = role[i];
            }
        }
    }
}
