import { SubmitableFormGroup } from '../../../models';
import { Component, Input, OnInit, ElementRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { InputBase } from '../input-base/input-base.component';
import { TypeEnum } from '../../../models/type-enum';
import { INumberMaskConfig } from '../mask/addons/create-number-mask';
import createNumberMask from '../mask/addons/create-number-mask';


@Component({
    selector: 'bw-number',
    styles: ['.form-control { text-align: right; } '],
    template: `
        <div class="input-group m-b-15 w-100" [class.fg-float]="floatingLabel" [class.fc-alt]="alt" style="width: 100%"
            [ngClass]="{ 'has-error': !control.valid &amp;&amp; (fg.submitted || control.dirty)}">
            <label *ngIf="label &amp;&amp; !floatingLabel">{{label}}</label>
            <span class="input-group-addon" *ngIf="leftIcon"><i class="zmdi zmdi-{{leftIcon}}"></i></span>
            <div class="fg-line" [class.disabled]="disabled" [class.fg-toggled]="toggled">
            <input class="form-control" #i type="text" [bwTextMask]="{ control: control, mask: numberMask }"
                placeholder="{{placeholder}}" [formControl]="control" [disabled]="disabled"
                (focus)="onFocus(i)" (blur)="onBlur(i)" />
            <label class="fg-label" *ngIf="label &amp;&amp; floatingLabel">{{label}}</label>
            </div><span class="input-group-addon last" *ngIf="rightIcon"><i class="zmdi zmdi-{{rightIcon}}"></i></span>
            <div *ngIf="!control.valid &amp;&amp; (control.dirty || fg.submitted)">
                <small class="help-block animated fadeInDown" *ngFor="let v of validations"
                    [class.hidden]="!control.errors[v.type]">{{v.message}}</small>
            </div>
        </div>
    `
})
export class NumberComponent extends InputBase implements OnInit {

    @Input() public fg: SubmitableFormGroup;
    @Input() public placeholder: string;
    @Input() public field: string;
    @Input() public label: string;
    @Input() public floatingLabel: boolean;
    @Input() public leftIcon: string;
    @Input() public rightIcon: string;
    @Input() public disabled: boolean;
    @Input() public value: number;
    @Input() public alt: boolean;

    @Input() public decimal: boolean;
    @Input() public currency: boolean;
    @Input() public percent: boolean;
    @Input() public prefix: string;
    @Input() public suffix: string;
    @Input() public decimalPlaces: number;

    // validators
    @Input() public required: boolean;
    @Input() public min: number;
    @Input() public max: number;

    public numberMask: (rawValue: any) => string[];

    constructor(el: ElementRef) {
        super(el);
        this.dataType = TypeEnum.Number;
    }

    public addValidators(): void {
        this.addMinValidation();
        this.addMaxValidation();
    }

    public ngOnInit(): void {
        this.onInit();

        const maskConfig: INumberMaskConfig = {
            allowDecimal: this.decimal,
            decimalLimit: this.decimalPlaces,
            prefix: this.prefix || '',
            suffix: this.suffix
        };

        // currency
        if (this.currency && !this.prefix) {
            maskConfig.prefix = '$ ';
            maskConfig.allowDecimal = true;
            maskConfig.decimalLimit = 2;
        }

        // percent
        if (this.percent) {
            maskConfig.suffix = ' %';
            maskConfig.allowDecimal = true;
            maskConfig.decimalLimit = 2;
        }

        this.numberMask = createNumberMask(maskConfig);
    }

    public ngOnDestroy(): void {

    }

}
