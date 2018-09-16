import { Component, Input } from '@angular/core';

import { FormGroupTypeSafe } from '../../shared/services';
import { ITarget } from '../shared/models/target';
import { IBasicUser } from '../shared/models/target-user';
import { IListItem } from '../../shared/ui/lists/list-item';
import { TargetScreenService } from '../shared/services/target-screen.service';

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

    constructor(private targetScreenService: TargetScreenService) { }

    addUser() {
        this.targetScreenService.addNewUser();
    }

    removeUser(index: number) {
        this.targetScreenService.removeUser(index);
    }
}
