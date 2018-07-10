import { IUserInfo } from '../../shared/models/user';
import { IAlert } from '../widget-alert-form/widget-alert-form.viewmodel';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { isEmpty, merge } from 'lodash';
import {MenuItem} from '../../ng-material-components';

@Component({
  selector: 'kpi-widgets-alert-list',
  templateUrl: './widgets-alert-list.component.pug',
  styleUrls: ['./widgets-alert-list.component.scss']
})
export class WidgetsAlertListComponent implements OnInit {
  @Input() alerts: IAlert[];
  @Input() users: IUserInfo[];
  @Output() done: EventEmitter<any> = new EventEmitter<any>();


  activeActionItem: MenuItem[] = [
    {
      id: 'more-vert',
      icon: 'more-vert',
      children: [
        { id: 'edit', title: 'Edit', icon: 'edit' },
        { id: 'delete', title: 'Delete', icon: 'delete' },
        { id: 'disable', title: 'Disable', icon: 'notifications-off' }
      ]
    }
  ];

  inactiveActionItem: MenuItem[] = [
    {
      id: 'more-vert',
      icon: 'more-vert',
      children: [
        { id: 'edit', title: 'Edit', icon: 'edit' },
        { id: 'delete', title: 'Delete', icon: 'delete' },
        { id: 'activate', title: 'Activate', icon: 'notifications' }
      ]
    }
  ];

  constructor() { }

  ngOnInit() { }

  actionClicked(item, alert: IAlert): void {
    const payload = {
      id: item.id,
      alertId: alert._id,
    };
    this.done.emit(payload);
  }

  listUsers(users: string[]): string {
    if (!this.users || !this.users.length) {
      return '';
    }

    const that = this;
    return this.users
                    .filter(user => users.indexOf(user._id) !== -1)
                    .map(user => {
                      if (!isEmpty(user.profile) && user.profile.firstName) {
                        return that.capitalizeFirstLetter(
                          `${user.profile.firstName} ${user.profile.lastName}`
                        );
                      }
                      return user.username;
                    })
                    .join(', ');
  }

  capitalizeFirstLetter(item: string): string {
    return item.replace(
      /\w\S*/g,
      function(txt){
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      }
    );
  }

}
