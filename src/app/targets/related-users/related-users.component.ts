import { Component, Input, OnInit } from '@angular/core';

import { FormGroupTypeSafe } from '../../shared/services';
import { IListItem } from '../../shared/ui/lists/list-item';
import { ITarget } from '../shared/models/target';
import { TargetScreenService } from '../shared/services/target-screen.service';
import { FormArray } from '@angular/forms';
import { NotificationService } from '../../shared/services/notification.service';
import { DeliveryMethodEnum } from '../../alerts/alerts.model';

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

    constructor(
        private targetScreenService: TargetScreenService,
        private notificationService: NotificationService,
    ) { }

    addUser() {
        this.targetScreenService.addNewUser();
    }

    removeUser(index: number) {
        this.targetScreenService.removeUser(index);
    }

    testNotification() {
        const users = this.targetScreenService.getUsers();
        const emailUsers = users.filter(u => u.email).map(u => u.identifier);
        const pushUsers = users.filter(u => u.push).map(u => u.identifier);
        const message = 'Target (Increase Revenue 10%): With an amount of 18,200.00 you have reached 52% of your goal of 35,000.00.';

        if (emailUsers.length) {
            this.notificationService.send(emailUsers, [DeliveryMethodEnum.email], message);
        }

        if (pushUsers.length) {
            this.notificationService.send(pushUsers, [DeliveryMethodEnum.push], message);
        }
    }
}
