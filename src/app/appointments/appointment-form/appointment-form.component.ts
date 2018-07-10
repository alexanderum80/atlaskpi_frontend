// Angular Import
import {
    Component,
    Input,
    OnInit
} from '@angular/core';

// App Code
import {
    IAppointment
} from '../shared/models/appointment.model';
import {
    AppointmentFormViewModel
} from './appointment-form.viewmodel';

@Component({
    selector: 'kpi-appointment-form',
    templateUrl: './appointment-form.component.pug',
    providers: [AppointmentFormViewModel]
})
export class AppointmentFormComponent implements OnInit {
    @Input() model: IAppointment;

    constructor(public vm: AppointmentFormViewModel) {}

    ngOnInit(): void {
        this.vm.initialize(this.model);
    }

    update(model: IAppointment): void {
        this.vm.update(model);
    }
}
