import { Component, Input } from '@angular/core';

import { ListTargetsViewModel } from './list-targets.viewmodel';
import { ITarget } from '../shared/models/target';
import { TargetScreenService } from '../shared/services/target-screen.service';
import { MenuItem } from '../../ng-material-components';

const targesDelete = require('graphql-tag/loader!./delete-target.gql');

@Component({
    selector: 'app-list-targets',
    templateUrl: './list-targets.component.pug',
    styleUrls: ['./list-targets.component.scss'],
    providers: [ListTargetsViewModel],
})
export class ListTargetsComponent {
    @Input()
    targetList: ITarget[];
    @Input()
    selected: ITarget;

    constructor(private targetService: TargetScreenService) { }

    targetActionList: MenuItem[] = [{
        id: 'more',
        icon: 'more-vert',
        children: [{
                id: 'edit',
                icon: 'edit',
                title: 'Edit'
            },
            {
                id: 'delete',
                icon: 'delete',
                title: 'Delete'
            }
        ]
    }];

    add() {
        this.targetService.addTarget();
    }

    select(item: ITarget) {
        this.targetService.selectTarget(item);
    }

    actionClicked(action) {

    }


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
