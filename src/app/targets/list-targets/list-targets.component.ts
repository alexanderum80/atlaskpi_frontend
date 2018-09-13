import { Component } from '@angular/core';

import { ListTargetsViewModel } from './list-targets.viewmodel';

const targesDelete = require('graphql-tag/loader!./delete-target.gql');

@Component({
    selector: 'kpi-list-targets',
    templateUrl: './list-targets.component.pug',
    styleUrls: ['./list-targets.component.scss'],
    providers: [ListTargetsViewModel],
})
export class ListTargetsComponent {
    // private delete(item) {
    //     const that = this;

    //     SweetAlert({
    //         title: 'Are you sure?',
    //         text: `Once deleted, you will not be able to recover this target.
    //               Also note that this action will remove all milestones associated with it, if any.`,
    //         type: 'warning',
    //         showConfirmButton: true,
    //         showCancelButton: true,
    //     }).then(res => {
    //         if (res.value === true) {
    //             this._apolloService
    //                 .mutation<ITargetNew>(targesDelete, { id: item })
    //                 .then(res => {
    //                     this.onDelete.emit(item);
    //                 })
    //                 .catch(err => {
    //                     this._displayServerErrors(err);
    //                 });
    //         }
    //     });
    // }

    // private _displayServerErrors(err) {
    //     console.log('Server errors: ' + JSON.stringify(err));
    // }
}
