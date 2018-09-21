import { Component, Input, OnInit } from '@angular/core';

import { FormGroupTypeSafe } from '../../shared/services';
import { IListItem } from '../../shared/ui/lists/list-item';
import { ITarget } from '../shared/models/target';
import { TargetScreenService } from '../shared/services/target-screen.service';
import { FormArray } from '@angular/forms';

@Component({
  selector: 'app-related-users',
  templateUrl: './related-users.component.pug',
  styleUrls: ['./related-users.component.scss']
})
export class RelatedUsersComponent {
    @Input()
    fg: FormGroupTypeSafe<ITarget>;
    @Input()
    userList: IListItem[];

    get users() { return (this.fg.get('notificationConfig.users') as FormArray).controls; }

    constructor(private targetScreenService: TargetScreenService) { }

    addUser() {
        this.targetScreenService.addNewUser();
    }

    removeUser(index: number) {
        this.targetScreenService.removeUser(index);
    }
}
