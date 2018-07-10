import { IAddress } from '../models/address';
import { Field, ViewModel } from '../../ng-material-components/viewModels';

export class AddressViewModel extends ViewModel<IAddress> {

    @Field({ type: String })
    street1: string;

    @Field({ type: String })
    street2: string;

    @Field({ type: String })
    city: string;

    @Field({ type: String })
    state: string;

    @Field({ type: String })
    zipCode: string;

    @Field({ type: String })
    country: string;

    public initialize(model: IAddress): void {
        this.onInit(model);
    }
}
