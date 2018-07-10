// Angular Import
import {
    Component,
    Input,
    OnInit
} from '@angular/core';

// App Code
import {
    IBusinessUnit
} from '../shared/models/business-unit.model';
import {
    BusinessUnitFormViewModel
} from './business-unit-form.viewmodel';

@Component({
    selector: 'kpi-business-unit-form',
    templateUrl: './business-unit-form.component.pug',
    providers: [BusinessUnitFormViewModel]
})
export class BusinessUnitFormComponent implements OnInit {
    @Input() model: IBusinessUnit;

    constructor(public vm: BusinessUnitFormViewModel) {}

    ngOnInit(): void {
        this.vm.initialize(this.model);
    }

    update(model: IBusinessUnit): void {
        this.vm.update(model);
    }
}
