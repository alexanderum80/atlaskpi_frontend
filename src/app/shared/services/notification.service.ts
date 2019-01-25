import { Apollo } from 'apollo-angular';
import { DeliveryMethodEnum } from '../../alerts/alerts.model';
import { Injectable } from '@angular/core';

const sendNotification = require('graphql-tag/loader!./send-notification.gql');

@Injectable()
export class NotificationService {

    constructor(private _apollo: Apollo) {}

    send(users: string[], deliveryMethods: DeliveryMethodEnum[], message: string) {
        return this._apollo.mutate({
            mutation: sendNotification,
            variables: { users, deliveryMethods, message }
        }).subscribe();
    }

}
