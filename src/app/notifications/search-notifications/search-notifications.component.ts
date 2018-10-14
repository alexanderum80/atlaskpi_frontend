import { Component, OnInit } from '@angular/core';
import { INotification } from '../shared/models/notification';

@Component({
    selector: 'kpi-search-notifications',
    templateUrl: './search-notifications.component.pug',
    styleUrls: ['./search-notifications.component.scss'],
})
export class SearchNotificationsComponent implements OnInit {
    notifications: INotification[];

    constructor() {
        // TODO: just for development
        this.notifications = [
            { deliveryMethod: 'email', timestamp: new Date(), message: 'Message 1' },
            { deliveryMethod: 'push', timestamp: new Date(), message: 'Message 2' },
            { deliveryMethod: 'push', timestamp: new Date(), message: 'Message 3' },
            { deliveryMethod: 'email', timestamp: new Date(), message: 'Message 4' },
            { deliveryMethod: 'email', timestamp: new Date(), message: 'Message 5' },
            { deliveryMethod: 'push', timestamp: new Date(), message: 'Message 6' },
            { deliveryMethod: 'email', timestamp: new Date(), message: 'Message 7' },

        ];
    }

    ngOnInit() {}
}
