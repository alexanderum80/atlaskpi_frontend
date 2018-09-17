import { Component, EventEmitter, Input, Output } from '@angular/core';

import { MenuItem } from '../../ng-material-components';
import { FormGroupTypeSafe } from '../../shared/services';
import { ITarget } from '../shared/models/target';
import { TargetScreenService } from '../shared/services/target-screen.service';
import { ListTargetsViewModel } from './list-targets.viewmodel';

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
    @Input()
    fg: FormGroupTypeSafe<ITarget>;

    @Output()
    remove = new EventEmitter<ITarget>();

    constructor(private targetService: TargetScreenService) { }

    targetActionList: MenuItem[] = [
        {
            id: 'delete',
            icon: 'delete',
        }
    ];

    add() {
        this.targetService.addTarget();
    }

    select(item: ITarget) {
        this.targetService.selectTarget(item);
    }

    actionClicked(action, target) {
        if (action.id === 'delete') {
            this.remove.emit(target);
        }
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
