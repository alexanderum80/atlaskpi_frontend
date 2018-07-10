import { SubmitableFormGroup } from '../../../models';
import { inputBaseTemplate } from '../input-base/input-base.template';
import { Component, Input, OnInit, ElementRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { InputBase } from '../input-base/input-base.component';

@Component({
    selector: 'bw-text-box',
    template: inputBaseTemplate,
})
export class TextBoxComponent extends InputBase implements OnInit {

    @Input() public fg: SubmitableFormGroup;
    @Input() public placeholder: string;
    @Input() public field: string;
    @Input() public label: string;
    @Input() public floatingLabel: boolean;
    @Input() public leftIcon: string;
    @Input() public rightIcon: string;
    @Input() public value: string;
    @Input() public disabled: boolean;
    @Input() public alt: boolean;

    // validators
    @Input() public required: boolean;
    @Input() public min: number;
    @Input() public max: number;

    constructor(el: ElementRef) {
        super(el);
    }

    public addValidators(): void {
        if (this.min) {
            this.validations.push(InputBase.minValidator(this.min));
        }

        if (this.max) {
            this.validations.push(InputBase.maxValidator(this.max));
        }
    }

    public ngOnInit(): void {
        this.onInit();
    }

}
