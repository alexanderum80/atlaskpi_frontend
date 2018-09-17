import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { combineLatest, Observable } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';

import { ChartData } from '../../charts/shared';
import { ModalComponent } from '../../ng-material-components';
import { ITarget } from '../shared/models/target';
import { IBasicUser } from '../shared/models/target-user';
import { TargetScreenService } from '../shared/services/target-screen.service';

const targetsQuery = require('graphql-tag/loader!./list-targets.gql');
const usersQuery = require('graphql-tag/loader!./get-users.query.gql');
const createTarget = require('graphql-tag/loader!./create-target.mutation.gql');
const updateTarget = require('graphql-tag/loader!./update-target.mutation.gql');

@Component({
    selector: 'app-targets-screen',
    templateUrl: './targets-screen.component.pug',
    styleUrls: ['./targets-screen.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [ TargetScreenService ],
})
export class TargetsScreenComponent implements OnInit {
    @Input()
    chart: ChartData;

    @ViewChild('targetModal')
    modal: ModalComponent;

    @Output()
    closed = new EventEmitter();

    ready$: Observable<boolean>;

    constructor(
        private apollo: Apollo,
        public model: TargetScreenService,
    ) {}

    ngOnInit() {
        this.model.initialize(this.chart);
        this.ready$ = this.loadDependencies();
    }

    close() {
        this.closed.emit();
    }

    async save() {
        const data = this.model.getData();
        const mutation = data._id ? updateTarget : createTarget;
        const variables = data._id ? { _id: data._id, data } : { data };
        delete data._id;

        const res = await this.apollo.mutate({ mutation, variables }).toPromise();
    }

    private loadDependencies() {
        return combineLatest(
            this.apollo.query<{ targetBySource: ITarget[] }>({
                query: targetsQuery,
                fetchPolicy: 'network-only',
                variables: { source: { identifier: this.chart._id } },
            }),
            this.apollo.query<{ allUsers: IBasicUser[] }>({
                query: usersQuery,
                fetchPolicy: 'network-only',
            }),
        ).pipe(
            filter(([targets, users]) => {
                return targets.data.targetBySource !== undefined
                    && users.data.allUsers !== undefined;
            }),
            tap(([targets, users]) => {
                this.model.targetList = targets.data.targetBySource.slice(0);
                this.model.userList = users.data.allUsers;

                // assign an empty target or the first one
                const target = !this.model.targetList.length ? null : this.model.targetList[0];

                if (!target) {
                    this.model.addTarget();
                } else {
                    this.model.selectTarget(target);
                }

            }),
            map(_ => true),
        );
    }
}
