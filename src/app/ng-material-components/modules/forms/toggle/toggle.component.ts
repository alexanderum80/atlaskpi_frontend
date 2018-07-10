import { SubmitableFormGroup } from '../../../models';
import { Component, Input, OnInit, ElementRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { InputBase } from '../input-base/input-base.component';
import { guid } from '../../../utils/utilities';

@Component({
    selector: 'bw-toggle',
    template: `
        <div class="toggle-switch" [class.disabled]="disabled" [attr.data-ts-color]="color">
            <label class="ts-label" [attr.for]="identifier">{{label}}</label>
            <input [attr.id]="identifier" type="checkbox" hidden="hidden"
                [disabled]="disabled" [formControl]="control" />
            <label class="ts-helper" [attr.for]="identifier"></label>
        </div>
    `,
})
export class ToggleComponent extends InputBase implements OnInit {

    @Input() public fg: SubmitableFormGroup;
    @Input() public placeholder: string;
    @Input() public field: string;
    @Input() public label: string;
    @Input() public value: string;
    @Input() public disabled: boolean;
    @Input() public color: string = '';

    public identifier: string;

    constructor(el: ElementRef) {
        super(el);
    }

    public addValidators(): void {
        // validators
    }

    public ngOnInit(): void {
        this.onInit();

        this.identifier = guid();
    }

}
