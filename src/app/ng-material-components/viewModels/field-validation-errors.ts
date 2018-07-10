import { ValidationErrors } from '@angular/forms';

export interface FieldValidationErrors {
    [name: string]: ValidationErrors | FieldValidationErrors | FieldValidationErrors[];
}
