import { AsyncValidatorFn, ValidatorFn, Validators } from '@angular/forms';
import { DecoratorType } from './decorator-type.enum';
import { addFieldMetadata } from './decorator-utils';
import { IDecoratorBase } from './decorator-base';


export interface IFieldDecoratorConfig extends IDecoratorBase {
    propertyName?: string;
    name?: string;
    type: any;
    disabled?: boolean;
    required?: boolean;
    validators?: ValidatorFn | [ValidatorFn];
    asyncValidators?: AsyncValidatorFn | [AsyncValidatorFn];
}

export function Field(config: IFieldDecoratorConfig) {
    return function(target: any, key: string) {
        addFieldMetadata(target, key, config, DecoratorType.Simple);
    };
}
