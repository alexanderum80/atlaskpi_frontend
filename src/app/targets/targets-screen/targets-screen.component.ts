import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { combineLatest, Observable } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';

import { ChartData } from '../../charts/shared';
import { ITarget } from '../shared/models/target';
import { TargetScreenService } from '../shared/services/target-screen.service';

const targetsQuery = require('graphql-tag/loader!./list-targets.gql');

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

    private loadDependencies() {
        return combineLatest(
            this.apollo.query<{ targetBySource: ITarget[] }>({
                query: targetsQuery,
                variables: { source: { identifier: this.chart._id } },
            }),
        ).pipe(
            filter(([targets]) => {
                return targets.data.targetBySource !== undefined;
            }),
            tap(([targets]) => {
                this.model.targetList = targets.data.targetBySource;

                // assign an empty target or the first one
                const target = !this.model.targetList.length ? null : this.model.targetList[0];
                this.model.selectTarget(target);
            }),
            map(_ => true),
        );
    }
}
