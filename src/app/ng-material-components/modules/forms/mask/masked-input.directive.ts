import { Directive, ElementRef, HostListener, Input, OnInit } from '@angular/core';
import { FormControl, ControlValueAccessor } from '@angular/forms';
import createTextMaskInputElement from './create-text-mask-input-element';

/* tslint:disable */
export interface ITextMaskConfig {
    control: FormControl;
    mask: string;
    guide: boolean;
    placeholderChar: string;
    pipe: any;
    keepCharPositions: boolean;
    onReject: any;
    onAccept: any;
}

@Directive({
    selector: 'input[bwTextMask]',
})
export class MaskedInputDirective implements OnInit, ControlValueAccessor {

    @Input('bwTextMask')
    textMaskConfig: ITextMaskConfig = {
        control: new FormControl(),
        mask: '',
        guide: true,
        placeholderChar: '_',
        pipe: undefined,
        keepCharPositions: false,
        onReject: undefined,
        onAccept: undefined,
    };

    private textMaskInputElement: any;
    private inputElement: HTMLInputElement;

    constructor(inputElement: ElementRef) {
        this.inputElement = inputElement.nativeElement;
    }

    writeValue(value: any) {
        this.textMaskInputElement.update(value);
        this.textMaskConfig.control.setValue(value, { onlySelf: true, emitEvent: false });
    }

    registerOnChange(fn: (value: any) => void) {
        this.textMaskConfig.control.valueChanges.subscribe(fn);
    }

    registerOnTouched() { }

    ngOnInit() {
        this.textMaskInputElement = createTextMaskInputElement(
            Object.assign({ inputElement: this.inputElement }, this.textMaskConfig)
        );

        // This ensures that initial model value gets masked
        setTimeout(() => this.onInput());
    }

    @HostListener('change')
    onInput() {
        this.textMaskInputElement.update();
        this.writeValue(this.inputElement.value);
    }
}
