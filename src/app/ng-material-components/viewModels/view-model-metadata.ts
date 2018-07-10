import { FormGroup } from '@angular/forms';
import { IFieldDecoratorConfig } from './field.decorator';

export interface ISubscriptionInfo {
    field: string;
    method: string;
    debounceTime?: number;
}

export interface IViewModelMetadata {
    instance: any;
    fg: FormGroup;
    fields: { [field: string]: IFieldDecoratorConfig };
    subscriptions: ISubscriptionInfo[];
    observableProperties:  string[];
}
