import { IChartDateRange, FrequencyEnum, parsePredefinedDate, IDateRangeItem } from '../models';
import * as m from 'moment';
import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { combineLatest, Observable, throwError } from 'rxjs';
import { filter, map, tap, catchError } from 'rxjs/operators';

const dateRangeQuery = require('graphql-tag/loader!./date-ranges.query.gql');

@Injectable()
export class DateService {

    private _dateRanges: IDateRangeItem[];
    get dateRanges(): IDateRangeItem[] {
        return this._dateRanges;
    }

    constructor(
        private apollo: Apollo,
    ) {
    }

    buildStartOfFrequencyList(chartDateRange: IChartDateRange, frequency: FrequencyEnum): m.Moment[] {
        let dr = chartDateRange.custom;
        let increment: m.unitOfTime.DurationConstructor;

        if (chartDateRange.predefined !== 'custom') {
            dr = parsePredefinedDate(chartDateRange.predefined);
        }

        switch (frequency) {
            case FrequencyEnum.Daily:
                increment = 'day';
                break;
            case FrequencyEnum.Monthly:
                increment = 'month';
                break;
            case FrequencyEnum.Quartely:
                increment = 'quarter';
                break;
            case FrequencyEnum.Weekly:
                increment = 'week';
                break;
            case FrequencyEnum.Yearly:
                increment = 'year';
                break;
        }

        let currentDate = m(dr.from);
        const result: m.Moment[] = [];

        if (!increment) { return result; }

        do {
            if (frequency !== FrequencyEnum.Weekly) {
                result.push(currentDate);
            } else {
                // weeks need a special treatment
                // because they should only be considered if
                // they are fully contained with in the year
                if (currentDate.clone().add(1, 'week').isSameOrBefore(dr.to)) {
                    result.push(currentDate);
                }
            }

            currentDate = currentDate.clone().add(1, increment);
        } while (currentDate.isSameOrBefore(dr.to));

        return result;
    }

    getFrequencyFormat(d: m.Moment, frequency: FrequencyEnum): string {
        let format: string;
        switch (frequency) {
            case FrequencyEnum.Daily:
                format = 'DD';
                break;
            case FrequencyEnum.Monthly:
                format = 'MMMM';
                break;
            case FrequencyEnum.Quartely:
                format = 'Qo';
                break;
            case FrequencyEnum.Weekly:
                format = 'wo';
                break;
            case FrequencyEnum.Yearly:
                format = 'YYYY';
                break;
        }

        return d.format(format);
    }

    get dateRanges$(): Observable<IDateRangeItem[]> {
        return this.apollo.query<{ dateRanges: IDateRangeItem[] }>({
            query: dateRangeQuery,
            fetchPolicy: 'cache-first',
        })
        .pipe(
            tap(_ => {
                this._dateRanges = _.data.dateRanges;
            }),
            catchError(error => {
                console.log(error);
                return throwError(error);
            }),
            map(_ => _.data.dateRanges),
        );
    }

}
