import {
    FormControl,
    FormGroup,
    RequiredValidator,
    Validator,
    Validators
} from '@angular/forms';
import {
    Component,
    Input,
    OnInit
} from '@angular/core';

@Component({
    selector: 'kpi-form-appointment',
    templateUrl: './form-appointment.component.pug',
    styleUrls: ['./form-appointment.component.scss']
})
export class FormAppointmentComponent implements OnInit {
    @Input() fg: FormGroup;

    constructor() {}

    ngOnInit() { }

}