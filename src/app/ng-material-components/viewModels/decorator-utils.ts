import { DecoratorType } from './decorator-type.enum';

export function addFieldMetadata(target: any, key: string, config, decoratorType: DecoratorType,  ) {
    if (!target.__metadata__) {
        target.__metadata__ = {};
    }

    if (!target.__metadata__.fields) {
        target.__metadata__.fields = {};
    }

    // save the property name
    config.propertyName = key;
    (config as any).__type = decoratorType;

    // if no name was provided use the key
    if (!config.name) {
        config.name = key;
    }

    target.__metadata__.fields[key] = config;

    return target.__metadata__.fields[key];
}
