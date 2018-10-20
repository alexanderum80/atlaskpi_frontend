import { AbstractControl, FormBuilder, FormControl, FormGroup } from '@angular/forms';

export type FormGroupControlsOf<T> = {
    [P in keyof T]: FormControl | FormGroup | any;
};

export type DisabledControls<T> = {
    [P in keyof T]: boolean | any;
};

export type PropertyFn<T> = (typeVal: T) => any;

export abstract class FormGroupTypeSafe<T> extends FormGroup {
    // give the value a custom type s
    value: T;

    // create helper methods to achieve this syntax eg:
    // this.form.getSafe(x => x.heroName).patchValue('Himan')
    public abstract getSafe(propertyFunction: PropertyFn<T>): AbstractControl;
    public abstract setControlSafe(propertyFunction: PropertyFn<T>, control: AbstractControl): void;
    public abstract setValueSafe(val: Partial<T>): void;
    public abstract patchValueSafe(val: Partial<T>): void;
    // public abstract disableFieldsSafe(val: Partial<DisabledControls<T>>): void;
    // public abstract updateDisableSafe(val: FormGroupControlsOf<T>): void;
    // If you need more function implement declare them here
    // but implement them on FormBuilderTypeSafe.group instantiation.
}

export class FormControlTypeSafe<T> extends FormControl {
    value: T;
}

export class FormBuilderTypeSafe extends FormBuilder {
    // override group to be type safe
    group<T>(controlsConfig: FormGroupControlsOf<T>, extra?: {
        [key: string]: any;
    } | null): FormGroupTypeSafe<T> {/*NOTE the return FormGroupTypeSafe<T> */

        // instantiate group from angular type
        const gr = super.group(controlsConfig, extra) as FormGroupTypeSafe<T>;

        const getPropertyName = (propertyFunction: Function): string => {
            // https://github.com/dsherret/ts-nameof - helped me with the code below, THANX!!!!
            // propertyFunction.toString() sample value:
            //  function(x) { return x.hero.address.postcode;}
            // we need the 'hero.address.postcode'
            // for gr.get('hero.address.postcode') function
            const properties = propertyFunction.toString()
                .match(/(?![. ])([a-z0-9_]+)(?=[};.])/gi)
                .splice(1);

            return properties.join('.');
        };

        if (gr) {
            // implement getSafe method
            gr.getSafe = (propertyFunction: (typeVal: T) => any): AbstractControl => {
                const getStr = getPropertyName(propertyFunction);
                const p = gr.get(getStr) as FormGroupTypeSafe<T>;
                return p;
            };

            // implement setControlSafe
            gr.setControlSafe = (propertyFunction: (typeVal: T) => any, control: AbstractControl): void => {
                const getStr = getPropertyName(propertyFunction);
                // console.log(getStr);
                gr.setControl(getStr, control);
            };

            // implement set value
            gr.setValueSafe = (val: Partial<T>) => {
                gr.setValue(val);
            };

            // implement patch value
            gr.patchValueSafe = (val: Partial<T>) => {
                gr.patchValue(val);
            };

            // update disable fields
            // gr.disableFieldsSafe = function(val: Partial<DisabledControls<T>>) {

            // };

            // implement more functions as needed
        }

        return gr;
    }
}
