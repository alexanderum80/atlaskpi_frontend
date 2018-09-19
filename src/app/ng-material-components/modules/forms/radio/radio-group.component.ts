import { SubmitableFormGroup } from '../../../models';
import { OnInit } from '@angular/core';
// from here: https://github.com/pleerock/ng2-radio-group

import { AfterViewInit, Component, ElementRef, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { InputBase } from '../input-base/input-base.component';
import { RadioGroupService } from './radio-group.service';

@Component({
    providers: [ RadioGroupService ],
    selector: 'bw-radio-group',
    template: `
        <div class="radio-group" [class.fc-alt]="alt">
            <ng-content></ng-content>
        </div>
    `,
})
export class RadioGroupComponent extends InputBase implements OnInit, AfterViewInit {

    @Input() public fg: SubmitableFormGroup;
    @Input() public field: string;
    @Input() public disabled: boolean = false;
    @Input() public defaultValue: string;
    @Input() public alt: boolean;

    private lastValueReceived: string;

    constructor(el: ElementRef, private service: RadioGroupService) {
        super(el);

        this.service.optionSelected$.subscribe((value) => {
            this.control.setValue(value);
        });
    }

    public ngOnInit(): void {
        this.onInit();

        this.service.fieldName = this.field;
        this.service.defaultValue = this.defaultValue;
    }

    public addValidators(): void {
        // nothign here
    }

    public ngAfterViewInit(): void {
        const that = this;
        this.control.valueChanges.subscribe((value) => {
            if (that.lastValueReceived === value) { return; }
            that.lastValueReceived = value;
            that.service.announceSelectedOption(value);
       });
    }

}
