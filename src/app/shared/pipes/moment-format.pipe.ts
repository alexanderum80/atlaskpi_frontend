import { Pipe, PipeTransform } from '@angular/core';
import { Moment } from 'moment';
import * as moment from 'moment';

@Pipe({
    name: 'momentFormat'
})
export class MomentFormatPipe implements PipeTransform {

    transform(value: Moment, format ? : string): string {
        if (!value) {
            return '';
        }

        if (!value.format) {
            value = moment(value);
        }

        return value.format(format);
    }
}
