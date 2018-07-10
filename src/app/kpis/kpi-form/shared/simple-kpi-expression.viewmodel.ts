import { IKPISimpleDefinition } from '../../../shared/domain/kpis/kpi';
import { ViewModel, Field } from '../../../ng-material-components/viewModels';

export class SimpleKpiExpressionViewModel extends ViewModel<IKPISimpleDefinition> {

    @Field({ type: String, required: true })
    function: string;

    @Field({ type: String, required: true })
    dataSource: string;

    @Field({ type: String, required: true })
    field: string;

    @Field({ type: String })
    operator: string;

    @Field({ type: String })
    value: string;

    initialize(model: IKPISimpleDefinition): void {
        this.onInit(model);
    }
}
