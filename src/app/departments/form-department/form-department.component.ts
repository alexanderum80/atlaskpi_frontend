import {
    FormDepartmentViewModel
} from './form-department.viewmodel';
import {
    IDepartment
} from '../shared/models/department.model';
import {
    FormGroup
} from '@angular/forms';
import {
    Component,
    Input,
    OnInit
} from '@angular/core';

@Component({
    selector: 'kpi-form-department',
    templateUrl: './form-department.component.pug',
    providers: [FormDepartmentViewModel]
})
export class FormDepartmentComponent implements OnInit {
    @Input() model: IDepartment;

    constructor(public vm: FormDepartmentViewModel) {}

    ngOnInit(): void {
        this.vm.initialize(this.model);
    }

    update(model: IDepartment): void {
        this.vm.update(model);
    }
}
