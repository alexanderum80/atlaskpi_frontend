import { Component, OnInit, Sanitizer } from '@angular/core';
import { INotification } from '../shared/models/notification';
import { ApolloService } from 'src/app/shared/services/apollo.service';
import { DomSanitizer } from '@angular/platform-browser';

const notificationsQuery = require('graphql-tag/loader!./notifications.gql');

@Component({
    selector: 'kpi-search-notifications',
    templateUrl: './search-notifications.component.pug',
    styleUrls: ['./search-notifications.component.scss'],
})
export class SearchNotificationsComponent implements OnInit {
    notifications: INotification[];
    loading = false;

    constructor(
        private apolloService: ApolloService,
        private sanitizer: DomSanitizer,
    ) {}

    ngOnInit() {
        this.loading = true;
        this.apolloService
            .networkQuery<INotification>(notificationsQuery)
            .then(res => {
                this.notifications = res.notifications.map((n: INotification) => ({
                    _id: n._id,
                    state: n.status,
                    message: this.sanitizer.bypassSecurityTrustHtml(n.message),
                    timestamp: new Date(n.timestamp),
                    deliveryMethod: n.deliveryMethod,

                }));
                this.loading = false;
            });
    }
}
