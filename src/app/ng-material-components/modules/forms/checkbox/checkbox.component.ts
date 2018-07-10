import { SubmitableFormGroup } from '../../../models';
import { Component, Input, OnInit, ElementRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { InputBase } from '../input-base/input-base.component';
import { TypeEnum } from '../../../models/type-enum';

/**
 * Encapsulate checkbox control functionality
 *
 */
@Component({
    selector: 'bw-checkbox',
    template: `
        <div class="checkbox m-b-25" [class.fc-alt]="alt">
            <label>
                <input class="form-control" type="checkbox" [formControl]="control" [disabled]="disabled"/>
                <i class="input-helper"></i>{{label}}
            </label>
        </div>
    `,
})
export class CheckboxComponent extends InputBase implements OnInit {

    @Input() fg: SubmitableFormGroup;
    @Input() field: string;
    @Input() label: string;
    @Input() disabled: boolean;
    @Input() value: boolean;
    @Input() alt: boolean;

    constructor(el: ElementRef) {
        super(el);
        this.dataType = TypeEnum.Boolean;
    }

    public addValidators(): void { }

    public ngOnInit(): void {
        this.onInit();
    }

    public ngOnDestroy(): void {

    }

}
