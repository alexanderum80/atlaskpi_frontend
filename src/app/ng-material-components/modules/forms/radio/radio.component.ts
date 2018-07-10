import { Component, Input, ElementRef, AfterViewInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { RadioGroupService } from './radio-group.service';

/**
 * Encapsulate checkbox control functionality
 *
 */
@Component({
    selector: 'bw-radio',
    template: `
        <div class="radio m-b-15" [class.disabled]="disabled">
            <label>
                <input type="radio" [name]="groupName" [disabled]="disabled"
                    [attr.value]="value" (click)="check()"/><i class="input-helper"></i>{{label}}
            </label>
        </div>
    `,
})
export class RadioComponent implements AfterViewInit {

    @Input() public fg: FormGroup;
    @Input() public field: string;
    @Input() public label: string;
    @Input() public disabled: boolean;
    @Input() public nane: string;
    @Input() public value: string;

    get groupName(): string {
        return this.service.fieldName.replace('.', '_');
    }

    constructor(
        private el: ElementRef,
        // @Host() @Inject(forwardRef(() => RadioGroupComponent)) private radioGroup: RadioGroupComponent
        private service: RadioGroupService
    ) { }

    public ngAfterViewInit() {
        const ele: any = this.el.nativeElement.getElementsByTagName('input')[0];

        this.service.optionSelected$.subscribe((value) => {
            ele.checked = value === this.value;
        });

        if (this.service.defaultValue === this.value) {
            window.setTimeout(() => { this.service.announceSelectedOption(this.value); }, 0);
        }
    }

    public check(): void {
        this._updateValue();
    }

    private _updateValue(): void {
        this.service.announceSelectedOption(this.value);
    }

}
