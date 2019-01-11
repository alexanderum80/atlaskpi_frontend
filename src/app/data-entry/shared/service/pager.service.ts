import { DataEntryFormViewModel } from './../../data-entry.viewmodel';
import { FormArray, FormGroup, FormControl } from '@angular/forms';
import { Injectable } from '@angular/core';

@Injectable()
export class PagerService {

    pager: any = {};
    pagedItems: any[];

    constructor(
        private _vm: DataEntryFormViewModel
    ) {}

    getPager(totalItems: number, currentPage: number = 1, pageSize: number = 10) {
        // calculate total pages
        const totalPages = Math.ceil(totalItems / pageSize);

        // ensure current page isn't out of range
        if (currentPage < 1) {
            currentPage = 1;
        } else if (currentPage > totalPages) {
            currentPage = totalPages;
        }

        let startPage: number, endPage: number;
        if (totalPages <= 10) {
            // less than 10 total pages so show all
            startPage = 1;
            endPage = totalPages;
        } else {
            // more than 10 total pages so calculate start and end pages
            if (currentPage <= 6) {
                startPage = 1;
                endPage = 10;
            } else if (currentPage + 4 >= totalPages) {
                startPage = totalPages - 9;
                endPage = totalPages;
            } else {
                startPage = currentPage - 5;
                endPage = currentPage + 4;
            }
        }

        // calculate start and end item indexes
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = Math.min(startIndex + pageSize - 1, totalItems - 1);

        // create an array of pages to ng-repeat in the pager control
        const pages = Array.from(Array((endPage + 1) - startPage).keys()).map(i => (startPage + i).toString());

        // return object with all pager properties required by the view
        return {
            totalItems: totalItems,
            currentPage: currentPage,
            pageSize: pageSize,
            totalPages: totalPages,
            startPage: startPage,
            endPage: endPage,
            startIndex: startIndex,
            endIndex: endIndex,
            pages: pages
        };
    }

    setPage(page: number, data: any) {
        // get pager object from service
        this.pager = this.getPager(data.length, page);

        // get current page of items
        this.pagedItems = data.slice(this.pager.startIndex, this.pager.endIndex + 1);

        // update page data into form group
        (this._vm.fg.get('data') as FormArray).controls = [];

        for (let i = 0; i < this.pagedItems.length; i++) {
          const element = this.pagedItems[i];
          this.addNewRow(element);
        }

        if (this.pager.currentPage === this.pager.totalPages) {
          this.addNewBlankRow();
        }
    }

    addNewRow(data) {
        (this._vm.fg.get('data') as FormArray).push(new FormGroup(
          data.map(d => {
            return new FormControl(d);
          })
        ));
    }

    addNewBlankRow() {
        const dataFormGroup = this._vm.fg.get('data') as FormArray;
        const schema = this._vm.fg.controls['schema'].value;

        dataFormGroup.push(new FormGroup(
            schema.map(() => {
                return new FormControl();
            })
        ));
    }

}
