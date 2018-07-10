/* tslint:disable */
import { ControlWithType } from '../../../models/control-with-type';

export interface ValidationResult {
    [key: string]: boolean;
}

interface Control {
    __isDecimal: boolean;
    value: string;
}

function processNumber(control: ControlWithType): number {
    'use strict';

    if (control.value.trim() === '') {
        return NaN;
    }

    let val: string = control.value.replace(',', '');

    // if the control is decimal the convert the number correctly
    if (val.length > 2 && control.__isDecimal) {
        val = val.replace('.', '');
        let num: string = val.substring(0, val.length - 2);
        let dec: string = val.substring(val.length - 2, val.length);
        val = `${num}.${dec}`;
    }

    return +val;
}

export class CustomValidators {

    static emailAddress(control: ControlWithType): ValidationResult {
        if (!control.value || control.value.trim() === '') {
            return { };
        }

        let EMAIL_REGEXP: RegExp = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;

        if (!EMAIL_REGEXP.test(control.value)) {
            return { invalidEmail: true };
        }

        return { };
    }

    static complexPassword(control: ControlWithType): ValidationResult {
        const checkType = Object.prototype.toString;
        if ((checkType.call(control.value) !== '[object Null]') && (control.value.trim() === '')) {
            return { };
        }

        let regExp: RegExp = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%&*\(\)]).{8,}/;
        let validPassword: boolean = regExp.test(control.value);

        if (!validPassword) {
            return { weakPassword: true };
        }

        return { };
    }

    static minNumber(min: number): Function {

        return (control: ControlWithType): ValidationResult => {
            // let value: number = +(control.value.replace(',', ''));
            let value: number = processNumber(control);

            if (isNaN(value)) {
                return { };
            }

            if (value < min) {
                return { tooLow: true };
            }

            return { };
        };

    }

    static maxNumber(max: number): Function {

        return (control: ControlWithType): ValidationResult => {
            let value: number = processNumber(control);

            if (isNaN(value)) {
                return { };
            }

            if (value > max) {
                return { tooHigh: true };
            }

            return { };
        };

    }

}
