import { SubmitableFormGroup } from '../../../models';
import { inputBaseTemplate } from '../input-base/input-base.template';
import { Component, Input, OnInit, ElementRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { InputBase } from '../input-base/input-base.component';

@Component({
    selector: 'bw-phone',
    styles: ['.form-control { text-align: right; } '],
    template: inputBaseTemplate,
})
export class PhoneComponent extends InputBase implements OnInit {

    @Input() public fg: SubmitableFormGroup;
    @Input() public placeholder: string;
    @Input() public field: string;
    @Input() public label: string;
    @Input() public floatingLabel: boolean;
    @Input() public leftIcon: string;
    @Input() public rightIcon: string;
    @Input() public disabled: boolean;
    @Input() public value: number;
    @Input() public fax: boolean;
    @Input() public alt: boolean;

    // validators
    @Input() public required: boolean;

    constructor(el: ElementRef) {
        super(el);
        this.inputType = 'tel';
    }

    public addValidators(): void {
        // nothing here
    }

    public ngOnInit(): void {
        this.onInit();

        if (!this.leftIcon) {
            this.leftIcon = this.fax ? 'account-box-phone' : 'phone';
        }
    }
}
