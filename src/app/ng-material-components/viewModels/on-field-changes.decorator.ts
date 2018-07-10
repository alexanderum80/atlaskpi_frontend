import { ISubscriptionInfo, IViewModelMetadata } from './view-model-metadata';
import { IDecoratorBase } from './decorator-base';

export interface IOnFieldChangesDecoratorConfig extends IDecoratorBase {
    name: string;
    debounceTime?: number;
}

export function OnFieldChanges(config?: IOnFieldChangesDecoratorConfig | IOnFieldChangesDecoratorConfig[]) {
    return function(target: any, method: string, descriptor: PropertyDescriptor) {
        if (!config) {
            throw new Error('OnField change decorator requires at least one field');
        }

        // convert argument to an array if it is not already one
        if (!(config instanceof Array)) {
            config = [config];
        }

        // make sure that the metadata placeholder so save subscription already exist
        if (!target.__metadata__) {
            target.__metadata__ = {} as IViewModelMetadata;
        }

        if (!target.__metadata__.subscriptions) {
            target.__metadata__.subscriptions = [];
        }

        config.forEach(c => {
            const subscription: ISubscriptionInfo = {
                field: c.name,
                method: method,
                debounceTime: c.debounceTime
            };

            target.__metadata__.subscriptions.push(subscription);
        });
    };
}
