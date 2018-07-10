import { Component, ElementRef, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { ControlWithType } from '../../../../models/control-with-type';
import { SubmitableFormGroup } from '../../../../models/submitable-form-group';
import { InputBase } from '../../input-base/input-base.component';
import { CalendarMode } from '../common/types/calendar-mode';
import { IDatePickerConfig } from '../date-picker/date-picker-config.model';

@Component({
    selector: 'bw-date-picker',
    templateUrl: './bw-date-picker.component.html',
    styleUrls: ['./bw-date-picker.component.scss']
})
export class BwDatePickerComponent extends InputBase implements OnInit {

    // ng material components attributes
    @Input() fg: SubmitableFormGroup;
    @Input() field: string;
    @Input() required = false;
    @Input() floatingLabel = true;
    @Input() label: string;
    @Input() leftIcon = 'calendar';
    @Input() rightIcon: string;
    @Input() disabled: boolean;
    @Input() alt: boolean;

    @Input() placeholder = '';

    // date picker attributes
    @Input() config: IDatePickerConfig;
    @Input() mode: CalendarMode = 'day';
    @Input() attachTo: ElementRef | string;
    @Input() theme = 'dp-material';

    control: ControlWithType;
    toggled: boolean;
    value: string;

    constructor() {
        super(null);
        // this.inputType = 'date';
    }

    public addValidators(): void { }

    public ngOnInit(): void {
        this.onInit();

        // assign default icon
        if (!this.leftIcon) {
            this.leftIcon = 'email';
        }

        const that = this;

        this.control.valueChanges.subscribe(v => {
          that.value = v;
        });
        if (!this.value && this.control.value) {
            this.value = this.control.value;
        }
    }

    valueChanged(value) {
        this.control.setValue(value);
    }

    onFocus(ele: any): void {
        this.toggled = true;
    }

    onBlur(ele: any): void {
        if (this.control && !this.control.value) {
            this.toggled = false;
        }
    }
}
