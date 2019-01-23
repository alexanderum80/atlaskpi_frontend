import { Injectable } from '@angular/core';

import { Apollo } from 'apollo-angular';
import { filter, map, tap, catchError } from 'rxjs/operators';
import { combineLatest, Observable, throwError } from 'rxjs';
import { SelectionItem } from '../../../ng-material-components';
import { IChartDateRange } from '../../../shared/models';
import { ToSelectionItemList } from '../../../shared/extentions';
import { DateService } from '../../../shared/services';

const kpiIdNameList = require('graphql-tag/loader!../graphql/kpi-list.query.gql');

@Injectable()
export class FunnelService {

    kpiSelectionList: SelectionItem[] = [];

    constructor(
        private apollo: Apollo,
    ) { }

    loadDependencies$(): Observable<boolean> {
       return this.apollo.query<{ kpis: { _id: string, name: string }[] }>({
                query: kpiIdNameList,
                fetchPolicy: 'network-only',
            })
         .pipe(
            tap(_ => {
                this.kpiSelectionList = ToSelectionItemList(_.data.kpis, '_id', 'name');
            }),
            catchError(error => {
                console.log(error);
                return throwError(error);
            }),
            map(_ => true)
        );
    }

    

}
