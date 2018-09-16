import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { combineLatest, Observable } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';

import { ChartData } from '../../charts/shared';
import { ITarget } from '../shared/models/target';
import { IBasicUser } from '../shared/models/target-user';
import { TargetScreenService } from '../shared/services/target-screen.service';

const targetsQuery = require('graphql-tag/loader!./list-targets.gql');
const usersQuery = require('graphql-tag/loader!./get-users.query.gql');
const createTarget = require('graphql-tag/loader!./create-target.mutation.gql');

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

    ready$: Observable<boolean>;

    constructor(
        private apollo: Apollo,
        public model: TargetScreenService,
    ) {}

    ngOnInit() {
        this.model.initialize(this.chart);
        this.ready$ = this.loadDependencies();
    }

    async save() {
        const res = await this.apollo.mutate({
            mutation: createTarget,
            variables: { data: this.model.getData() }
        }).toPromise();
        console.log(res);
    }

    private loadDependencies() {
        return combineLatest(
            this.apollo.query<{ targetBySource: ITarget[] }>({
                query: targetsQuery,
                variables: { source: { identifier: this.chart._id } },
            }),
            this.apollo.query<{ allUsers: IBasicUser[] }>({
                query: usersQuery,
            }),
        ).pipe(
            filter(([targets, users]) => {
                return targets.data.targetBySource !== undefined
                    && users.data.allUsers !== undefined;
            }),
            tap(([targets, users]) => {
                this.model.targetList = targets.data.targetBySource;
                this.model.userList = users.data.allUsers;

                // assign an empty target or the first one
                const target = !this.model.targetList.length ? null : this.model.targetList[0];
                this.model.selectTarget(target);
            }),
            map(_ => true),
        );
    }
}
