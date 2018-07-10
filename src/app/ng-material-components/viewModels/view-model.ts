import { IUserInfo } from '../../shared/models/user';
import { IActivity } from '../../shared/authorization/activity';
import { AbstractControl, FormArray, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { isArray, isObject } from 'lodash';
import { Subscription } from 'rxjs/Subscription';

import { IArrayFieldDecoratorConfig } from './array-field.decorator';
import { DecoratorType } from './decorator-type.enum';
import { FieldValidationErrors } from './field-validation-errors';
import { IFieldDecoratorConfig } from './field.decorator';
import { ISubscriptionInfo, IViewModelMetadata } from './view-model-metadata';
import { UserService } from '../../shared/services/index';

const JavascriptTypes = ['string', 'number', 'boolean'];

export interface IActivityInfo {
    [name: string]: IActivity;
}

/**
 * Base view model class
 */
export abstract class ViewModel < T > {
    private __metadata__: IViewModelMetadata;
    private __subscriptions__: Subscription[];
    public _id?: string;

    private _initialized = false;
    private _activities: IActivityInfo = {};
    private _userSubscription: Subscription;
    protected _user: IUserInfo;

    constructor(userService?: UserService) {
        this.__subscriptions__ = [];

        if (userService) {
            this._watchUserChanges(userService);
        }
    }

    abstract initialize(model: T): void;

    onDestroy() {
        if (this._userSubscription) {
            this._userSubscription.unsubscribe();
        }
    }

    get initialized(): boolean {
        return this._initialized;
    }


    onInit(_model: T) {
        this.__metadata__.instance = this;
        const cleanModel = this.objectWithoutProperties(_model, ['__typename']);
        Object.assign(this, cleanModel);
        this.__metadata__.fg = this._getFormGroupFor(this, _model, this.__metadata__);

        this._createFieldSubscriptions(this.__metadata__.subscriptions);
        this._initialized = true;
    }

    dispose() {
        this.__subscriptions__.forEach(s => {
            s.unsubscribe();
        });
    }

    update(model: T) {
        const clonedValue = this.objectWithoutProperties(model, ['__typename']);
        Object.assign(this, clonedValue);
    }

    /**
     * Return a form group instance based on the view model configuration
     */
    get formGroup(): FormGroup {
        return this.__metadata__.fg;
    }

    // Alias to formGroup
    get fg(): FormGroup {
        return this.__metadata__.fg;
    }

    /**
     * Determine if the view model is valid
     */
    get valid(): boolean {
        return this.formGroup.valid;
    }

    /**
     * Returns the model value of this viewmodel instance ONLY when this viewmodel is VALID
     */
    get modelValue(): T {
        return this.__metadata__.fg.valid ?
            this._getCleanValues(this.__metadata__.fg, this.__metadata__.fields) :
            null;
    }

    getValidationErrors(): FieldValidationErrors {
        return this._getFormGroupErrors(this.__metadata__.fg);
    }


    objectWithoutProperties(obj, keys) {
        const that = this;

        if (JavascriptTypes.indexOf(typeof(obj)) !== -1 ) {
            return obj;
        }

        const target = {};
        for (const propertyName in obj) {
            if (keys.indexOf(propertyName) >= 0) { continue; }

            const value = obj[propertyName];

            if (isArray(value)) {
                target[propertyName] = value.map(o => that.objectWithoutProperties(o, keys));
            } else if (isObject(value)) {
                target[propertyName] = that.objectWithoutProperties(value, keys);
            } else {
                target[propertyName] = value;
            }

        }

        return target;
    }

    addActivities(activities: IActivity[]) {
        if (!activities) {
            return;
        }

        activities.forEach(activity => {
            if (activity) {
                this._activities[activity.name] = activity;
            }
        });
    }

    authorizedTo(activityName: string) {
        const activity = this._activities[activityName];
        return activity ? activity.check(this._user) : false;
    }

    private _watchUserChanges(userService: UserService) {
        const that = this;

        if (userService) {
            if (userService.user) {
                that._user = userService.user;
            }

            that.__subscriptions__.push(userService.user$.subscribe(currentUser => {
                that._user = currentUser;
            }));
        }
    }


    private _getFormGroupErrors(fg: FormGroup): FieldValidationErrors {
        if (!(fg instanceof FormGroup)) {
            throw new Error('You passed a non FormGroup instance to getFormGroupErrors');
        }

        const errors: FieldValidationErrors = {};

        Object.keys(fg.controls).forEach(key => {
            const control = fg.get(key);

            if (control instanceof FormControl) {
                if (control.errors) {
                    errors[key] = control.errors;
                }
            } else if (control instanceof FormGroup) {
                const fgErrors = this._getFormGroupErrors(control);

                if (fgErrors) {
                    errors[key] = fgErrors;
                }
            } else if (control instanceof FormArray) {
                const faErrors = this._getFormArrayErrors(control);

                if (faErrors) {
                    errors[key] = faErrors;
                }
            }

        });

        return Object.keys(errors).length > 0 ? errors : null;
    }

    private _getFormArrayErrors(fa: FormArray): FieldValidationErrors[] {
        if (!(fa instanceof FormArray)) {
            throw new Error('You passed a non FormArray instance to _getFormArrayErrors');
        }

        const errors: FieldValidationErrors[] = [];

        for (let i = 0; i < fa.controls.length; i++) {
            const control = fa.controls[i];
            let error: any;

            if (control instanceof FormControl) {
                if (control.errors) {
                    error = control.errors;
                }
            } else if (control instanceof FormGroup) {
                const fgErrors = this._getFormGroupErrors(control);
                if (fgErrors) {
                    error = fgErrors;
                }
            } else if (control instanceof FormArray) {
                const faErrors = this._getFormArrayErrors(control);
                if (faErrors) {
                    error = faErrors;
                }
            }

            if (error) {
                errors.push(error);
            }
        }

        return errors.length > 0 ? errors : null;
    }

    private _getFormGroupFor(context: any, model: T, metadata: IViewModelMetadata): FormGroup {
        const fg = new FormGroup({});
        const fields = Object.keys(metadata.fields);

        fields.forEach(f => {
            const fieldConfig = metadata.fields[f];
            let control: FormControl | FormGroup | FormArray;

            switch (fieldConfig.__type) {
                case DecoratorType.Simple:
                    const dataValue = model ? model[fieldConfig.propertyName] : null;
                    control = this._getFormControlForSimpleField(dataValue, fieldConfig);
                    this._createFieldProperty(context, control, fieldConfig.propertyName, dataValue);
                    break;
                case DecoratorType.Complex:
                    const dataObject = model ? model[fieldConfig.propertyName] || {} : {};
                    control = this._getFormGroupFor(dataObject, dataObject, fieldConfig.__metadata__);
                    this._createComplexFieldProperty(context, control, fieldConfig.propertyName, dataValue);
                    break;
                case DecoratorType.Array:
                    const dataArray = model ? model[fieldConfig.propertyName] || {} : [];
                    control = this._getFormArrayForArrayField(dataArray, fieldConfig);
                    this._createArrayFieldProperty(context, control, fieldConfig, dataValue);
                    break;
            }

            fg.addControl(fieldConfig.name, control);
        });

        return fg;
    }

    private _getFormControlForSimpleField(data: any, fieldConfig: IFieldDecoratorConfig): FormControl {
        const fieldName = fieldConfig.name;

        if (fieldConfig.required) {
            if (!fieldConfig.validators) {
                fieldConfig.validators = Validators.required;
            } else {
                if (fieldConfig.validators instanceof Array) {
                    (fieldConfig.validators as[ValidatorFn]).push(Validators.required);
                } else {
                    fieldConfig.validators = [Validators.required, (fieldConfig.validators as ValidatorFn)] as any;
                }
            }
        }

        return new FormControl({ value: data, disabled: fieldConfig.disabled }, fieldConfig.validators, fieldConfig.asyncValidators);
    }

    private _getFormArrayForArrayField(data: any[], fieldConfig: IArrayFieldDecoratorConfig): FormArray {
        // get type metadata
        const typeInstance = new fieldConfig.type();
        // data = data || [];
        const fgs = data instanceof Array ?
            data.map(d => this._getFormGroupFor(d, d, typeInstance.__metadata__)) : [];

        return new FormArray(fgs);
    }

    private _createFieldProperty(target, formControl: FormControl, name: string, value: any) {
        const instanceVar = `__${name}__`;

        if (target[instanceVar]) {
            throw new Error('Cannot create a new property because there is alredy a property called: ' + instanceVar);
        }

        Object.defineProperty(target, name, {
            configurable: false,
            get: () => formControl.value,
            set: (newValue) => {
                if (newValue === formControl.value) {
                    return;
                }

                formControl.setValue(newValue);
            }
        });
    }

    private _createComplexFieldProperty(target, formGroup: FormGroup, name: string, value: any) {
        const that = this;
        const instanceVar = `__${name}__`;

        if (target[instanceVar]) {
            throw new Error('Cannot create a new property because there is alredy a property called: ' + instanceVar);
        }

        Object.defineProperty(target, name, {
            configurable: false,
            get: () => {
                const fgValue = formGroup.value;
                that._createFormGroupProperties(fgValue, formGroup);

                return fgValue;
            },
            set: (newValue) => {
                if (newValue === formGroup.value) {
                    return;
                }

                formGroup.setValue(newValue);
            }
        });
    }

    private _createArrayFieldProperty(target, formArray: FormArray, fieldConfig: IFieldDecoratorConfig, value: any): void {
        const instanceVar = `__${fieldConfig.name}__`;

        if (target[instanceVar]) {
            throw new Error('Cannot create a new property because there is alredy a property called: ' + instanceVar);
        }

        Object.defineProperty(target, fieldConfig.name, {
            configurable: false,
            get: () => {
                const arrayResult = formArray.value;

                arrayResult.push = (control: AbstractControl) => formArray.push(control);
                arrayResult.pop = () => formArray.removeAt(formArray.length - 1);
                arrayResult.slice = (start: number, end ?: number) => {
                    end = start + (end || start);

                    if (start > end) {
                        return;
                    }

                    for (let i = start; i < end; i++) {
                        formArray.removeAt(i);
                    }
                };

                // convert array elements to getters and setters that use the form control and group classes
                const that = this;

                for (let i = 0; i < arrayResult.length; i++) {
                    const formGroup = formArray.at(i) as FormGroup;
                    that._createFormGroupProperties(arrayResult[i], formGroup);
                }

                return arrayResult;
            },
            set: (newValue: any[]) => {
                if (!isArray(newValue)) {
                    throw new Error('You can on assign arrays to array fields');
                }

                // clean for array first
                for (let i = 0; i < formArray.controls.length; i++) {
                    formArray.removeAt(i);
                }

                // add new elements to form array
                const formGroups = newValue.map(v => {
                    const fg = this._getFormGroupFor({}, v, fieldConfig.type.prototype.__metadata__);
                    formArray.push(fg);
                });
            }
        });
    }

    private _createFormGroupProperties(target: any, formGroup: FormGroup) {
        Object.keys(formGroup.controls).forEach(p => {
            const abstractControl = formGroup.controls[p];

            if (abstractControl instanceof FormControl) {
                this._createFieldProperty(target, abstractControl, p, target[p]);
            } else if (abstractControl instanceof FormGroup) {
                this._createComplexFieldProperty(target, abstractControl, p, target[p]);
            } else if (abstractControl instanceof FormArray) {
                // TODO: Fix p here .. it should and IFieldDecoratorConfig
                this._createArrayFieldProperty(target, abstractControl, p as any, target[p]);
            }
        });
    }



    private _createFieldSubscriptions(subscriptions: ISubscriptionInfo[]): void {
        this.__subscriptions__ = [];

        if (!subscriptions) {
            return;
        }

        const that = this;

        subscriptions.forEach(s => {
            let valueChanges = that.formGroup.get(s.field).valueChanges;

            if (s.debounceTime > 0) {
                valueChanges = valueChanges.debounceTime(s.debounceTime);
            }

            const sub = valueChanges.subscribe(v => {
                const result = {};
                result[s.field] = v;

                that[s.method](result);
            });

            that.__subscriptions__.push(sub);
        });
    }

    private _getCleanValues(fg: FormGroup, fields: {
        [field: string]: IFieldDecoratorConfig
    }): T {
        // const output = {};
        // const fieldNames = Object.keys(fields);

        // fieldNames.forEach(f => {
        //     const field = fields[f];
        //     const fc = fg.controls[field.name];
        //     output[f] = fc.value ? field.type(fc.value) : null;
        // });

        // // once I have the output I need to do some more cleaning
        // // of the following properties
        // // propertyName, type, __metadata__, __type, _initialized
        // const value = clone(output);
        // removeMetadata(value, ['propertyName', 'type', '__metadata__', '__type', '_initialized']);

        // return value as T;
        return fg.value;
    }
}

function removeMetadata(obj, keysToRemove: string[]) {
    for (const prop in obj) {
      if (keysToRemove.indexOf(prop) !== -1) {
          delete obj[prop];
      } else if (typeof obj[prop] === 'object') {
          removeMetadata(obj[prop], keysToRemove);
      }
    }
}

