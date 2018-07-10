import { Field, ViewModel } from '../../ng-material-components/viewModels';
import { ITagItem } from '../domain/shared/tag';

export class TagsViewModel extends ViewModel<ITagItem> {

    @Field({ type: String })
    value: string;

    @Field({ type: String })
    display: string;

    public initialize(model: ITagItem): void {
        this.onInit(model);
    }
}
