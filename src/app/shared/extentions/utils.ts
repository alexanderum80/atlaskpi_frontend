import { FormGroup } from '@angular/forms';
import { IMutationResponse, IFieldErrors } from '../models';
import { isEmpty } from 'lodash';

export function objToQueryString(obj: any) {

  if (typeof obj === 'string') {
    return obj;
  }

  let queryString = '';

  if (!obj) {
    return queryString;
  }

  Object.keys(obj).forEach((key: string) => {
    const value = obj[key];
    if (value) {
      queryString += `${key}=${encodeURIComponent(value)}&`;
    }
  });

  return queryString;
}

export function toJson(obj: any) {

    try {

       return obj.json();

    } catch (e) {

        console.log('cannot deserialize the current json object');

        return null;

    }
}

/**
 * This assign the errors to the corresponding fields in a form group
 * @returns A list of the errors not associated to any field
 */
export function processMutationErrors(response: IMutationResponse, form: FormGroup): IFieldErrors[] {
    if (!response || !response.errors) {
        return;
    }

    response.errors.forEach((error) => {
        error.errors.forEach((err) => {
            form.controls[error.field].setErrors({ notUnique: err });
        });
    });

    // only add to this list general errors (errors withtout field names)
    const errors = response.errors.filter((error) => error.field === '');
    return errors.length > 0 ? errors : null;
}

// Custom String Functions
export function strToKpiBiUrl(value: string): string {
     return value.toLocaleLowerCase().replace(/[_ ]/g, '-');
}

export function toCamelCase(value: string): string {
  return value.toLowerCase()
    .replace( /['"]/g, '' )
    .replace( /\W+/g, ' ' )
    .replace( / (.)/g, function($1) { return $1.toUpperCase(); })
    .replace( / /g, '' );
}

export function getEnumString(E: any, key: any): string {
    return E[key].toString();
}

export function IsNullOrWhiteSpace(value: string): boolean {
    try {
            if (value === null || value === 'undefined') { return true; }
            return value.toString().replace(/\s/g, '').length < 1;
    } catch (e) {
            console.log(e);
            return false;
    }
}

export function abbreviate_number(num, fixed) {
    if (num === null) { return null; } // terminate early
    if (num === 0) { return '0'; } // terminate early
    fixed = (!fixed || fixed < 0) ? 0 : fixed; // number of decimal places to show
    const b = (num).toPrecision(2).split('e'), // get power
        k = b.length === 1 ? 0 : Math.floor(Math.min(b[1].slice(1), 14) / 3), // floor at decimals, ceiling at trillions
        c = k < 1 ? num.toFixed(0 + fixed) : (num / Math.pow(10, k * 3) ).toFixed(1 + fixed), // divide by power
        d = c < 0 ? c : Math.abs(c), // enforce -0 is 0
        e = d + ['', 'K', 'M', 'B', 'T'][k]; // append power
    return e;
}

export function roundWithDecimals(x, n) {
    return Math.round(x * Math.pow(10, n)) / Math.pow(10, n);
}

export function getHostname(): string {
    const hostTokens = window.location.hostname.split('.');
    return hostTokens && hostTokens.length > 3 && !isEmpty(hostTokens[0])
           ? hostTokens[0]
           : null;
}
