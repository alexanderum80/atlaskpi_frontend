import { Component, Input, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Subscription } from 'rxjs';
import SweetAlert from 'sweetalert2';
import { clone } from 'lodash';

import { MenuItem } from '../../../ng-material-components';
import { FormGroupTypeSafe } from '../../../shared/services';
import { IListItem } from '../../../shared/ui/lists/list-item';
import { IMilestone } from '../../shared/models/milestone';
import { TargetScreenService } from '../../shared/services/target-screen.service';

@Component({
    selector: 'app-milestone-item',
    templateUrl: './milestone-item.component.pug',
    styleUrls: ['./milestone-item.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MilestoneItemComponent implements OnInit, OnDestroy {
    @Input()
    fg: FormGroupTypeSafe<IMilestone>;
    @Input()
    userList: IListItem[];
    @Input()
    index: number;

    actionItems: MenuItem[];

    private baseActionItems: MenuItem[] = [
            {
                id: 'edit',
                icon: 'edit',
                title: 'Edit'
            },
            {
                id: 'delete',
                icon: 'delete',
                title: 'Delete'
            }
    ];

    private statusList: MenuItem[] = [
        { id: 'due', title: 'Mark as: Due' },
        { id: 'completed', title: 'Mark as: Completed' },
        { id: 'declined', title: 'Mark as: Declined' },
    ];

    private statusSub: Subscription;

    constructor(private targetService: TargetScreenService) { }

    ngOnInit() {
        const statusCtrl = this.fg.getSafe(f => f.status);
        this.statusSub = statusCtrl.valueChanges
            .subscribe(s => this.actionItems = this.getActionItems(s));
        this.actionItems = this.getActionItems(statusCtrl.value);
    }

    ngOnDestroy() {
        this.statusSub.unsubscribe();
    }

    private getActionItems(val: string): MenuItem[] {
        const actions = {
            id: 'more',
            icon: 'more-vert',
            children: clone(this.baseActionItems),
        };
        this.statusList.filter(s => s.id !== val)
            .forEach(s => actions.children.push(s));

        return [actions];
    }

    get line(): IMilestone {
        return this.fg.value;
    }

    get responsibleList(): string[] {
        return this.line.responsible.split('|').map(r => {
            const user = this.targetService.userList.find(u => u._id === r);
            return `${user.profile.firstName} ${user.profile.lastName}`;
        });
    }

    actionClicked(action: MenuItem) {
        const statusCtrl = this.fg.getSafe(f => f.status);

        switch (action.id) {
            case 'edit':
                this.fg.markAsDirty();
                break;
            case 'delete':
                this.delete();
                break;
            case 'due':
                statusCtrl.setValue('due');
                break;
            case 'completed':
                statusCtrl.setValue('completed');
                break;
            case 'declined':
                statusCtrl.setValue('declined');
                break;
        }
    }

    delete() {
        SweetAlert({
            title: 'Are you sure?',
            text: `You are about to delete a milestone, do you want to continue?`,
            type: 'warning',
            showConfirmButton: true,
            showCancelButton: true
        })
        .then((res) => {
            this.targetService.removeMilestone(this.index);
        });
    }
}
