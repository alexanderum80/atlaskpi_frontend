import { DecoratorType } from './decorator-type.enum';
import { IViewModelMetadata } from './view-model-metadata';

export interface IDecoratorBase {
    __type?: DecoratorType;
    __metadata__?: IViewModelMetadata;
}
