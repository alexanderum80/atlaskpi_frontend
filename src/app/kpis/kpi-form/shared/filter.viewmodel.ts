import { Field, ViewModel } from '../../../ng-material-components/viewModels';
import { IKPIFilter } from '../../../shared/domain/kpis/kpi';

export class FilterViewModel extends ViewModel<IKPIFilter> {
    editing = false;

    @Field({ type: Number })
    order?: number;

    @Field({ type: String, required: true })
    field: string;

    @Field({ type: String, required: true })
    operator: string;

    @Field({ type: String, required: true })
    criteria: string|string[];

    @Field({ type: String })
    sourceValue?: string;

    initialize(model: IKPIFilter): void {
        this.onInit(model);
    }
}
