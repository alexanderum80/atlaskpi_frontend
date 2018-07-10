import * as Promise from 'bluebird';
import { map } from 'lodash';
import * as validate from 'validate.js';

import { IRole } from '../role';

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

export class RoleModel extends BaseModel<IRole> {

    private _id?: string;
    private name: string;
    private permissions: any[];
    private timestamp?: string;

    static Create(role: IRole) {
        const roleInstance = new RoleModel(role);
        return roleInstance.validationErrors.length === 0 ? roleInstance : null;
    }

    static CreateAsync(role: IRole) {
        return new Promise((resolve, reject) => {
            const roleInstance = new RoleModel(role);
            if (roleInstance.validationErrors.length === 0) {
                resolve(roleInstance);
                return;
            }
            resolve(null);
        });
    }

    private constructor(role: IRole) {
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
                    name: this.name,
                    permissions: this.permissions
                }
            };
        }
        return {
            data: {
                name: this.name,
                permissions: this.permissions
            }
        };
    }

    protected validate(role: IRole) {

        const constraints = {
            name: {
                presence: { message: 'cannot be blank'}
            },
            permissions: {
                presence: { message: 'must select permission'}
            }
        };

        const errors = (<any>validate)((<any>role), constraints, { fullMessages: false} );

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
