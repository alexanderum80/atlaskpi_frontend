import { IDateRange, IChartDateRange } from './date-range';
// import * as moment from 'moment';
// import { IQueryString } from './query-string';
// import { objToQueryString } from '../extentions';

// export interface IDateRange {
//     from: string;
//     to: string;
// }

// export class DateRange implements IQueryString {
//     constructor(public start?: moment.Moment | string, public end?: moment.Moment | string) {

//         if (start) {
//             start = moment(start);
//         }

//         if (end) {
//             end = moment(end);
//         }

//         this.start = start && (<moment.Moment>start).isValid() ? moment(start) : moment();
//         this.end = end && (<moment.Moment>end).isValid() ? moment(end) : moment();
//     }

//     get isValid() {
//         return this.start && this.end && (<moment.Moment>this.start).isSameOrBefore(this.end);
//     }

//     toQueryString() {
//         const start = moment(this.start).startOf('day');
//         const end = moment(this.end).endOf('day');

//         const payload = {
//             'date[start]': start.format('MM/DD/YYYY HH:mm:ss'),
//             'date[end]': end.format('MM/DD/YYYY HH:mm:ss'),
//         };

//         return objToQueryString(payload);
//     }
// }


import * as moment from 'moment';

export interface IDateRange {
    from: Date;
    to: Date;
}

export const DateRange = {
    from: Date,
    to: Date,
};

export interface IChartDateRange {
    predefined?: string;
    custom?: IDateRange;
}

export const PredefinedDateRanges = {
    today: 'today',
    yesterday: 'yesterday',
    thisWeek: 'this week',
    thisWeekToDate: 'this week to date',
    thisMonth: 'this month',
    thisMonthToDate: 'this month to date',
    thisQuarter: 'this quarter',
    thisQuarterToDate: 'this quarter to date',
    thisYear: 'this year',
    thisYearToDate: 'this year to date',
    lastWeek: 'last week',
    lastMonth: 'last month',
    last3Months: 'last 3 months',
    last6Months: 'last 6 months',
    lastQuarter: 'last quarter',
    lastYear: 'last year',
    lastYearToDate: 'last year to date',
    last2YearsToDate: 'last 2 years to date',
    last2Years: 'last 2 years',
    last3Years: 'last 3 years',
    last4Years: 'last 4 years',
    last5Years: 'last 5 years',
    last7Days: 'last 7 days',
    last14Days: 'last 14 days',
    last30Days: 'last 30 days',
    last90Days: 'last 90 days',
    last365Days: 'last 365 days',
    allTimes: 'all times'
};

export const PredefinedComparisonDateRanges = {
    today_yesterday: 'yesterday',
    today_lastWeek: 'last week',
    today_lastMonth: 'last month',
    today_lastYear: 'last year',
    yesterday_lastWeek: 'last week',
    yesterday_lastMonth: 'last month',
    yesterday_lastYear: 'last year',
    thisWeek_lastMonth: 'last month',
    thisWeek_lastYear: 'last year',
    thisWeekToDate_lastMonth: 'last month',
    thisWeekToDate_lastYear: 'last year',
    lastWeek_lastMonth: 'last month',
    lastWeek_lastYear: 'last year',
    thisMonth_lastMonth: 'last month',
    thisMonth_lastYear: 'last year',
    thisMonthToDate_lastYear: 'last year',
    lastMonth_lastYear: 'last year',
    lastMonth_2YearsAgo: '2 years ago',
    thisQuarter_lastQuarter: 'last quarter',
    thisQuarter_lastYear: 'last year',
    lastQuarter_lastYear: 'last year',
    lastQuarter_2YearsAgo: '2 years ago',
    lastQuarterThreeYearsAgo: '3 years ago',
    last3Months_lastYear: 'last year',
    last3Months_2YearsAgo: '2 years ago',
    last3MonthsTwoYearsAgo: 'two years ago',
    last3Months_3YearsAgo: '3 years ago',
    last3MonthsThreeYearsAgo: 'three years ago',
    last6Months_lastYear: 'last year',
    last6Months_2YearsAgo: '2 years ago',
    last6MonthsTwoYearsAgo: 'two years ago',
    last6Months_3YearsAgo: '3 years ago',
    last6MonthsThreeYearsAgo: 'three years ago',
    last6MonthsFourYearsAgo: 'four years ago',
    thisYear_lastYear: 'last year',
    thisYear_2YearsAgo: '2 years ago',
    thisYear_3YearsAgo: '3 years ago',
    thisYearToDate_lastYear: 'last year',
    thisYearToDate_2YearsAgo: '2 years ago',
    thisYearToDate_3YearsAgo: '3 years ago',
    lastYear_2YearsAgo: '2 years ago',
    lastYear_3YearsAgo: '3 years ago',
    custom_previousPeriod: 'previous period',
    custom_lastYear: 'last year',
    custom_2YearsAgo: '2 years ago',
    custom_3YearsAgo: '3 years ago',
    custom_4YearsAgo: '4 years ago',
    custom_5YearsAgo: '5 years ago',

    customTwoYearsAgo: 'two years ago',
    customThreeYearsAgo: 'three years ago',
    customFourYearsAgo: 'four years ago',
    customFiveYearsAgo: 'five years ago'
};

export const quarterMonths = {
    '1': ['Jan', 'Feb', 'Mar'],
    '2': ['Apr', 'May', 'Jun'],
    '3': ['Jul', 'Aug', 'Sep'],
    '4': ['Oct', 'Nov', 'Dec']
};

const thisQuarter = moment().quarter();

export function parsePredifinedDate(textDate: string): IDateRange {

    switch (textDate) {
        case PredefinedDateRanges.allTimes:
            return {
                from: (<any>moment).min(moment().subtract(30, 'years'), moment().subtract(1, 'years')).startOf('year').toDate(),
                to: moment().toDate()
            };
        case PredefinedDateRanges.lastWeek:
            return {
                from: moment().subtract(1, 'week').startOf('week').toDate(),
                to: moment().subtract(1, 'week').endOf('week').toDate()
            };
        case PredefinedDateRanges.lastMonth:
            return {
                from: moment().subtract(1, 'month').startOf('month').toDate(),
                to: moment().subtract(1, 'month').endOf('month').toDate()
            };
        case PredefinedDateRanges.last3Months:
            return {
                from: moment().subtract(3, 'month').startOf('month').toDate(),
                to: moment().subtract(1, 'month').endOf('month').toDate()
            };
        case PredefinedDateRanges.last6Months:
            return {
                from: moment().subtract(6, 'month').startOf('month').toDate(),
                to: moment().subtract(1, 'month').endOf('month').toDate()
            };
        case PredefinedDateRanges.lastQuarter:
            const lastQtr = thisQuarter - 1 || 4;
            const year = (thisQuarter - 1)
                         ? moment().year()
                         : moment().subtract(1, 'year');

            return {
                from: moment(year).quarter(lastQtr).startOf('quarter').toDate(),
                to: moment(year).quarter(lastQtr).endOf('quarter').toDate()
            };
        case PredefinedDateRanges.lastYear:
            return {
                from: moment().subtract(1, 'year').startOf('year').toDate(),
                to: moment().subtract(1, 'year').endOf('year').toDate()
            };
        case PredefinedDateRanges.last2Years:
            return {
                from: moment().subtract(2, 'year').startOf('year').toDate(),
                to: moment().subtract(1, 'year').endOf('year').toDate()
            };
        case PredefinedDateRanges.last3Years:
            return {
                from: moment().subtract(3, 'year').startOf('year').toDate(),
                to: moment().subtract(1, 'year').endOf('year').toDate()
            };
        case PredefinedDateRanges.last4Years:
            return {
                from: moment().subtract(4, 'year').startOf('year').toDate(),
                to: moment().subtract(1, 'year').endOf('year').toDate()
            };
        case PredefinedDateRanges.last5Years:
            return {
                from: moment().subtract(5, 'year').startOf('year').toDate(),
                to: moment().subtract(1, 'year').endOf('year').toDate()
            };
        case PredefinedDateRanges.lastYearToDate:
            return {
                from: moment().subtract(1, 'year').startOf('year').toDate(),
                to: moment().endOf('day').toDate()
            };
        case PredefinedDateRanges.last2YearsToDate:
            return {
                from: moment().subtract(2, 'year').startOf('year').toDate(),
                to: moment().endOf('day').toDate()
            };
        case PredefinedDateRanges.thisWeek:
            return {
                from: moment().startOf('week').toDate(),
                to: moment().endOf('week').toDate()
            };
        case PredefinedDateRanges.thisMonth:
            return {
                from: moment().startOf('month').toDate(),
                to: moment().endOf('month').toDate()
            };
        case PredefinedDateRanges.thisQuarter:
            return {
                from: moment().quarter(thisQuarter).startOf('quarter').toDate(),
                to: moment().quarter(thisQuarter).endOf('quarter').toDate()
            };
        case PredefinedDateRanges.thisYear:
            return {
                from: moment().startOf('year').toDate(),
                to: moment().endOf('year').toDate()
            };
        case PredefinedDateRanges.yesterday:
            return {
                from: moment().subtract(1, 'days').startOf('day').toDate(),
                to: moment().subtract(1, 'days').endOf('day').toDate()
            };
        case PredefinedDateRanges.thisWeekToDate:
            return {
                from: moment().startOf('isoWeek').toDate(),
                to: moment().endOf('day').toDate()
            };
        case PredefinedDateRanges.today:
            return {
                from: moment().startOf('day').toDate(),
                to: moment().endOf('day').toDate()
            };
        case PredefinedDateRanges.thisMonthToDate:
            return {
                from: moment().startOf('month').toDate(),
                to: moment().endOf('day').toDate()
            };
        case PredefinedDateRanges.thisQuarterToDate:
        return {
            from: moment().quarter(thisQuarter).startOf('quarter').toDate(),
            to: moment().endOf('day').toDate()
        };
        case PredefinedDateRanges.thisYearToDate:
            return {
                from: moment().startOf('year').toDate(),
                to: moment().endOf('day').toDate()
            };
        case PredefinedDateRanges.last7Days:
            return {
                from: moment().subtract(7, 'days').startOf('day').toDate(),
                to: moment().subtract(1, 'days').endOf('day').toDate()
            };
        case PredefinedDateRanges.last14Days:
            return {
                from: moment().subtract(14, 'days').startOf('day').toDate(),
                to: moment().subtract(1, 'days').endOf('day').toDate()
            };
        case PredefinedDateRanges.last30Days:
            return {
                from: moment().subtract(30, 'days').startOf('day').toDate(),
                to: moment().subtract(1, 'days').endOf('day').toDate()
            };
        case PredefinedDateRanges.last90Days:
            return {
                from: moment().subtract(90, 'days').startOf('day').toDate(),
                to: moment().subtract(1, 'days').endOf('day').toDate()
            };
        case PredefinedDateRanges.last365Days:
            return {
                from: moment().subtract(365, 'days').startOf('day').toDate(),
                to: moment().subtract(1, 'days').endOf('day').toDate()
            };
    }

}

/**
 * @param value
 * @param customDateRange
 * customDateRange passed when chart predefined is custom
 */
export function parseComparisonDateRange(value: string, customDateRange?: IDateRange): IDateRange {
    const comparisonTokens = value;

    if (!comparisonTokens || comparisonTokens.length < 2) {
        return null;
    }

    let firstDateRange;
    /// check if object exist, has from and to property
    const hasCustomDateRange = customDateRange && customDateRange.from && customDateRange.to;

    if (hasCustomDateRange) {
        // use the custom range for 'to' and 'from' property
        firstDateRange = {
            from: moment(customDateRange.from).toDate(),
            to: moment(customDateRange.to).toDate()
        };
    } else {
        firstDateRange = parsePredifinedDate(comparisonTokens[0]);
    }

    // check if undefined
    // create empty object if variable is undefined
    if (!firstDateRange) {
        firstDateRange = {};
    }

    switch (comparisonTokens[1]) {

        // today cases
        case 'yesterday':
            return backInTime(firstDateRange, 1, 'day');

        case 'lastWeek':
            return backInTime(firstDateRange, 1, 'week');

        case 'lastMonth':
            return backInTime(firstDateRange, 1, 'month');

        case '2YearsAgo':
            return backInTime(firstDateRange, 2, 'year');

        case '3YearsAgo':
            return backInTime(firstDateRange, 3, 'year');

        case 'lastYear':
            return backInTime(firstDateRange, 1, 'year');

        case 'twoYearsAgo':
            return backInTime(firstDateRange, 2, 'year');

        case 'threeYearsAgo':
            return backInTime(firstDateRange, 3, 'year');

        case 'lastQuarter':
            // TODO: we have to calculate the previous Q, just back in time 90 days for now
            return backInTime(firstDateRange, 90, 'days');

        case 'previousPeriod':
            return previousPeriod(firstDateRange);

    }

    return null;
}

export function backInTime(dateRange: IDateRange, amount: any, timespan: string): IDateRange {
    return {
        from: moment(dateRange.from).subtract(amount, timespan).toDate(),
        to: moment(dateRange.to).subtract(amount, timespan).toDate()
    };
}

export function previousPeriod(dateRange: IDateRange): IDateRange {
    const start =  moment(dateRange.from);
    const end = moment(dateRange.to);
    const duration = end.diff(start);

    return {
        from: start.subtract(duration).toDate(),
        to: end.subtract(duration).toDate()
    };
}

export function getDateRangeIdentifier(text: string): string {
    const dateRangesKeys = Object.keys(PredefinedDateRanges);

    for (let i = 0; i < dateRangesKeys.length; i++) {
        if (PredefinedDateRanges[dateRangesKeys[i]] === text) {
            return dateRangesKeys[i];
        }
    }
    return null;
}

export function lastQuarter(quarterProperty: number) {
    const getStartQuarter = (quarterProperty === 1) ? 4 : (quarterProperty - 1);
    const lStartQuarter = quarterMonths[getStartQuarter][0];
    const lEndQuarter = quarterMonths[getStartQuarter][2];

    if (quarterProperty === 1) {
        return {
            from: moment().utc().month(lStartQuarter).subtract(1, 'year').startOf('month').toDate(),
            to: moment().utc().month(lEndQuarter).subtract(1, 'year').endOf('month').toDate()
        };
    } else {
        return {
            from: moment().utc().month(lStartQuarter).startOf('month').toDate(),
            to: moment().utc().month(lEndQuarter).endOf('month').toDate()
        };
    }
}

export class ChartDateRangeModel {
    predefined?: string;
    custom?: IDateRange;

    private _parsedDateRange: IDateRange;

    constructor(obj: IChartDateRange) {
        if (obj.predefined) {
            this._parsedDateRange = parsePredifinedDate(obj.predefined);
        }
        if (this._parsedDateRange !== undefined) { return; }

        if (obj.custom !== undefined) {
            const from = moment(obj.custom.from);
            const to = moment(obj.custom.to);

            if (to.isSameOrAfter(from)) {
                this._parsedDateRange = { from: from.toDate(), to: to.toDate() };
            }
        }
    }

    get valid(): boolean {
        return this._parsedDateRange !== undefined;
    }
}



export interface IDateRangeComparisonItem {
    key: string;
    value: string;
}

export interface IDateRangeItem {
    dateRange: IChartDateRange;
    comparisonItems: IDateRangeComparisonItem[];
}