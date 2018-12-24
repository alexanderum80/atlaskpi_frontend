import { FormGroup } from '@angular/forms';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'myfilter',
    pure: false
})
export class MyFilterPipe implements PipeTransform {
    transform(items: any[], filter: FormGroup): any {
        const filterValues = filter[0].controls.filter(f => f.value !== '' && f.value !== null);
        if (!filterValues.length) {
            return items;
        }
        return items.filter(item => this.applyFilter(item, filter[0].controls));
    }

    applyFilter(book: any, filter: Object): boolean {
        for (const field in filter) {
          if (filter[field]) {
            if (typeof book.controls[field].value === 'number') {
                if (book.controls[field].value.toString() === filter[field].value) {
                  return true;
                }
            } else if (typeof book.controls[field].value === 'string') {
                const bookValue = book.controls[field].value ? book.controls[field].value.toLowerCase() : null;
                const filterValue = filter[field].value ? filter[field].value.toLowerCase() : null;
                if (bookValue.indexOf(filterValue) !== -1) {
                    return true;
                }
            }
          }
        }
        return false;
      }
}
