import { IManageUsers } from './../../users/shared/models/user';
import { AlertsFormService } from './../alerts.service';
import { Component, OnInit, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import { FormArray, FormGroup, FormControl } from '@angular/forms';
import { SelectionItem } from 'src/app/ng-material-components';
import { INotificationUsers } from '../alerts.model';
import { ApolloService } from 'src/app/shared/services/apollo.service';
import { UserService } from '../../shared/services';

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
    private _userSvc: UserService
  ) { }

  ngOnInit() {
    this._getUsersList();
    this.userList = this.alertsFormService.usersList;
  }

  ngOnChanges() {
    this.notifications = this.fg.get('notificationUsers') as FormArray;
    this.notifications.controls = [];

    if (this.notificationUsers.length > 0) {
      this.notificationUsers.map(notification => {
        const fgValues = {
          user: notification.user,
          byEmail: notification.byEmail,
          byPhone: notification.byPhone
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

  currentUser(): any {
    this._userSvc.user$.subscribe(user => {
      if (user) {
        this._currentUser = user._id;
      }
    });
  }

  private async _getUsersList() {
    await this._apolloService.networkQuery < IManageUsers[] > (usersQuery).then(data => {
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

}
