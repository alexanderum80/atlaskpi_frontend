import { SubmitableFormGroup } from '../../../models';
import { inputBaseTemplate } from '../input-base/input-base.template';
import { Component, Input, OnInit, ElementRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { InputBase } from '../input-base/input-base.component';
import { CustomValidators } from '../validators/custom-validators';
import { ValidationInfo } from '../../../models/validation-info';

@Component({
    selector: 'bw-email',
    template: inputBaseTemplate,
})
export class EmailComponent extends InputBase implements OnInit {

    @Input() public fg: SubmitableFormGroup;
    @Input() public placeholder: string;
    @Input() public field: string;
    @Input() public label: string;
    @Input() public floatingLabel: boolean;
    @Input() public leftIcon: string;
    @Input() public rightIcon: string;
    @Input() public disabled: boolean;
    @Input() public value: string;
    @Input() public alt: boolean;

    // validators
    @Input() public required: boolean;

    public validations: ValidationInfo[];

    constructor(el: ElementRef) {
        super(el);
        this.inputType = 'email';
    }

    public addValidators(): void {
        this.validations.push(
            {
                message: `Email address is invalid`,
                type: 'invalidEmail',
                validator: CustomValidators.emailAddress,
            }
        );
    }

    public ngOnInit(): void {
        this.onInit();

        // assign default icon
        if (!this.leftIcon) {
            this.leftIcon = 'email';
        }
    }
}
