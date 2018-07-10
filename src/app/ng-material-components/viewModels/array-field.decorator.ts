import { DecoratorType } from './decorator-type.enum';
import { addFieldMetadata } from './decorator-utils';
import { IDecoratorBase } from './decorator-base';


export interface IArrayFieldDecoratorConfig extends IDecoratorBase {
    propertyName?: string;
    name?: string;
    type: any;
}

export function ArrayField(config: IArrayFieldDecoratorConfig) {
    return function(target: any, key: string) {
        addFieldMetadata(target, key, config, DecoratorType.Array);
    };
}
