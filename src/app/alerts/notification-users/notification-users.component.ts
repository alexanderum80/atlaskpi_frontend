import { IManageUsers } from './../../users/shared/models/user';
import { AlertsFormService } from './../alerts.service';
import { Component, OnInit, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import { FormArray, FormGroup, FormControl } from '@angular/forms';
import { SelectionItem } from 'src/app/ng-material-components';
import { INotificationUsers, DeliveryMethodEnum } from '../alerts.model';
import { ApolloService } from 'src/app/shared/services/apollo.service';
import { UserService } from '../../shared/services';
import { NotificationService } from '../../shared/services/notification.service';
import { flatMap } from 'lodash';

const usersQuery = require('graphql-tag/loader!../../users/shared/graphql/get-all-users.gql');

@Component({
    selector: 'kpi-notification-users',
    templateUrl: './notification-users.component.pug',
    styleUrls: ['./notification-users.component.scss'],
    providers: [AlertsFormService]
})
export class NotificationUsersComponent implements OnInit, OnChanges {
    @Input() fg: FormGroup;
    @Input() notificationUsers: INotificationUsers[];

    userList: SelectionItem[];
    notifications: FormArray;
    _currentUser = '';

    constructor(
        public alertsFormService: AlertsFormService,
        private _apolloService: ApolloService,
        private _userSvc: UserService,
        private _notificationService: NotificationService,
    ) { }

    ngOnInit() {
        this._getUsersList();
        this.userList = this.alertsFormService.usersList;
    }

    ngOnChanges() {
        this.notifications = this.fg.get('users') as FormArray;
        this.notifications.controls = [];
        if (this.notificationUsers.length > 0) {
            const pushNotify = this.notificationUsers.filter(pn => pn.deliveryMethods.length === 1 && pn.deliveryMethods[0] === 'push');
            const emailNotify = this.notificationUsers.filter(pn => pn.deliveryMethods.length === 1 && pn.deliveryMethods[0] === 'email');
            const bothNotify = this.notificationUsers.filter(pn => pn.deliveryMethods.length === 2);
            const notifyArray = [];
            notifyArray.push(pushNotify);
            notifyArray.push(emailNotify);
            notifyArray.push(bothNotify);
            notifyArray.forEach(na => {
                if (na.length > 0) { this.buildFormArray(na); }
            });
        } else {
            if (!this.notifications) {
                this.notifications = new FormArray([
                    new FormGroup({
                        user: new FormControl(''),
                        byEmail: new FormControl(false),
                        byPhone: new FormControl(false)
                    })
                ]);
            }
        }
    }

    buildFormArray(itemArray: any[]) {
        const fgValues = {
            user: itemArray.map(i => i.identifier).join('|'),
            byEmail: itemArray[0].deliveryMethods.find(d => d === 'email') !== undefined,
            byPhone: itemArray[0].deliveryMethods.find(d => d === 'push') !== undefined
        };
        if (!this.notifications) {
            this.notifications = new FormArray([
                new FormGroup({
                    user: new FormControl(fgValues.user),
                    byEmail: new FormControl(fgValues.byEmail),
                    byPhone: new FormControl(fgValues.byPhone)
                })
            ]);
        } else {
            this.notifications.push(new FormGroup({
                user: new FormControl(fgValues.user),
                byEmail: new FormControl(fgValues.byEmail),
                byPhone: new FormControl(fgValues.byPhone)
            }));
        }
    }

    currentUser(): any {
        this._userSvc.user$.subscribe(user => {
            if (user) {
                this._currentUser = user._id;
            }
        });
    }

    private async _getUsersList() {
        await this._apolloService.networkQuery<IManageUsers[]>(usersQuery).then(data => {
            const usersCollection = data.allUsers.map(user => {
                return {
                    id: user._id,
                    title: user.username,
                    seleted: false
                };
            });
            this.alertsFormService.updateUsersList(usersCollection);
        });
    }

    addNotification() {
        this.currentUser();
        this.notifications.push(new FormGroup(
            {
                user: new FormControl(this._currentUser),
                byEmail: new FormControl(false),
                byPhone: new FormControl(true)
            }
        ));
    }

    removeNotification(notification: FormGroup) {
        if (!notification) {
            return;
        }
        const notificationIndex = this.notifications.controls.findIndex(c => c === notification);
        if (notificationIndex > -1) {
            this.notifications.removeAt(notificationIndex);
        }
    }

    testNotification() {
        const users = this.notifications.value;
        const emailUsers = users.filter(u => u.byEmail).map(u => u.user.split('|'));
        const pushUsers = users.filter(u => u.byPhone).map(u => u.user.split('|'));
        const message = 'Hey! - First sales of day is equal to $1,500.00 which is greater than $500.00.';

        if (emailUsers.length) {
            this._notificationService.send(flatMap(emailUsers, u => u), [DeliveryMethodEnum.email], message);
        }

        if (pushUsers.length) {
            this._notificationService.send(flatMap(pushUsers, u => u), [DeliveryMethodEnum.push], message);
        }
    }

}
