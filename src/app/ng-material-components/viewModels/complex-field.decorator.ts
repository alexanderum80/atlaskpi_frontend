import { AsyncValidatorFn, ValidatorFn, Validators } from '@angular/forms';
import { DecoratorType } from './decorator-type.enum';
import { addFieldMetadata } from './decorator-utils';
import { IDecoratorBase } from './decorator-base';

export interface IComplexFieldDecoratorConfig extends IDecoratorBase {
    propertyName?: string;
    name?: string;
    type: any;
}

export function ComplexField(config?: IComplexFieldDecoratorConfig) {
    return function(target: any, key: string) {
        const metadata = addFieldMetadata(target, key, config, DecoratorType.Complex);
        // for complex type we need to create the complex type on the fly to generate the
        // metadata for it
        if (!config.type) {
            throw new Error(`Complex type definitions for key: ${key} need a type`);
        }
        metadata.__metadata__ = new config.type().__metadata__;
    };
}
