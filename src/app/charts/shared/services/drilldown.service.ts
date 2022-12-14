import { IDateRange, parsePredefinedDate } from '../../../shared/models';
import { isEmpty, uniq } from 'lodash';
import * as moment from 'moment';

import { quarterMonths, PredefinedDateRanges, IChartDateRange, PredefinedComparisonDateRanges, AKPIDateFormatEnum } from '../../../shared/models/date-range';
import { FrequencyTable } from '../../../shared/models/frequency';
import { IChartTreeNode } from '../../chart-view/chart-view.component';
import { camelCase } from 'change-case';

const chartFrequencies: any = {};
const YEAR_FORMAT = 'YYYY';

Object
    .keys(FrequencyTable)
    .forEach(key => {
        chartFrequencies[key] = key;
    });

export class DrillDownService {
    getFrequencyType(categoryName: any) {
        switch (true) {
            case isEmpty(categoryName) === true:
                return false;
            // convert year to monthly
            case categoryName.length === 4:
                return moment(categoryName, 'YYYY').isValid()
                    ? chartFrequencies.monthly
                    : false;
            // convert monthly to daily
            case categoryName.length === 3:
                return moment(categoryName, 'MMM').isValid()
                    ? chartFrequencies.daily
                    : false;
            case categoryName.length === 1:
                return false;
            // quarterly
            case categoryName.length === 2:
                return this.isQuarterly(categoryName)
                    ? chartFrequencies.quarterly
                    : false;
            default:
                return false;
        }
    }

    isQuarterly(category: string) {
        return /Q[1-4]/.test(category);
    }

    getDrillDownDateRange(category: any, dateRange: any, year?: any, frequency?: string) {
        const frequencyType = this.getFrequencyType(category);

        if (year == null) {
            year = moment(new (Date)).format('YYYY');
        }

        if (!frequencyType) {
            return [];
        }

        if (dateRange.from && dateRange.to) {
            if (frequency !== chartFrequencies.yearly) {
                const customYears = this._getCustomYears(dateRange);
                switch (frequencyType) {
                    case chartFrequencies.monthly:
                        return customYears.map((years) => {
                            return {
                                predefined: null,
                                custom: {
                                    from: moment(years, YEAR_FORMAT)
                                        .year(years)
                                        .startOf('year')
                                        .format(AKPIDateFormatEnum.US_DATE),
                                    to: moment()
                                        .year(years)
                                        .endOf('year')
                                        .format(AKPIDateFormatEnum.US_DATE)
                                }
                            };
                        });
                    case chartFrequencies.daily:
                        const mappedDateRange = customYears.map((years) => {
                            const drillDaterange = {
                                predefined: null,
                                custom: {
                                    from: moment(years, YEAR_FORMAT)
                                        .year(years)
                                        .month(category)
                                        .startOf('month')
                                        .format(AKPIDateFormatEnum.US_DATE),
                                    to: moment()
                                        .year(years)
                                        .month(category)
                                        .endOf('month')
                                        .format(AKPIDateFormatEnum.US_DATE)
                                }
                            };

                            /* if the custom date range doens't include the beginning of the frequency
                                chart daterange -> [Nov 11, 2015 -- Dec 31, 2016]

                                user clicked "Nov"
                                
                                2 date ranges for drilldown 
                                    - Nov 11 - Nov 30 2015
                                    - Nov 01 - Nov 30 2016
                            */
                            if (moment(drillDaterange.custom.from).isBefore(dateRange.from)
                                && moment(drillDaterange.custom.from).month() === moment(dateRange.from).month()) {

                                drillDaterange.custom.from = dateRange.from;
                            }

                            /* if the custom date range doens't include the end of the frequency
                                chart daterange -> [Nov 11, 2015 -- Dec 15, 2016]
                                
                                user clicked "Dec"
                                
                                2 date ranges for drilldown 
                                    - Dec 01 - Dec 31 2015
                                    - Dec 01 - Dec 15 2016
                            */
                            if (moment(drillDaterange.custom.to).isAfter(dateRange.to)
                                && moment(drillDaterange.custom.to).month() === moment(dateRange.to).month()) {

                                drillDaterange.custom.to = dateRange.to;
                            }

                            return drillDaterange;

                        });

                        //- Exclude date ranges that are not included in the custom date range.
                        /* if the custom date range doens't include the month for some year
                                chart daterange -> [Nov 11, 2015 -- Dec 15, 2016]
                                
                                user clicked "Oct"
                                
                                1 date ranges for drilldown 
                                    - Oct 01 - Oct 31 2016
                            */
                        return mappedDateRange.filter(date => (
                            (
                                (moment(date.custom.to).isBefore(dateRange.to) ||
                                    moment(date.custom.to).isSame(dateRange.to)
                                ) &&
                                (moment(date.custom.from).isAfter(dateRange.from) ||
                                    moment(date.custom.from).isSame(dateRange.from))))
                        )

                    case chartFrequencies.quarterly:
                        const getQuarter = quarterMonths[category[1]];
                        return customYears.map((years) => {
                            return {
                                predefined: null,
                                custom: {
                                    from: moment(years, YEAR_FORMAT)
                                        .year(years)
                                        .month(getQuarter[0])
                                        .startOf('month')
                                        .format(AKPIDateFormatEnum.US_DATE),
                                    to: moment()
                                        .year(years)
                                        .month(getQuarter[2])
                                        .endOf('month')
                                        .format(AKPIDateFormatEnum.US_DATE)
                                }
                            };
                        });

                }
            } else {
                switch (frequencyType) {
                    case chartFrequencies.monthly:
                        return [{
                            predefined: null,
                            custom: {
                                from: moment(dateRange.from)
                                    .year(year)
                                    .startOf('year')
                                    .format(AKPIDateFormatEnum.US_DATE),
                                to: moment(dateRange.to)
                                    .year(year)
                                    .endOf('year')
                                    .format(AKPIDateFormatEnum.US_DATE)
                            }
                        }];
                    case chartFrequencies.daily:
                        return [{
                            predefined: null,
                            custom: {
                                from: moment(dateRange.from)
                                    .year(year)
                                    .month(category)
                                    .startOf('month')
                                    .format(AKPIDateFormatEnum.US_DATE),
                                to: moment(dateRange.to)
                                    .year(year)
                                    .month(category)
                                    .endOf('month')
                                    .format(AKPIDateFormatEnum.US_DATE)
                            }
                        }];
                    case chartFrequencies.quarterly:
                        const getQuarter = quarterMonths[category[1]];
                        return [{
                            predefined: null,
                            custom: {
                                from: moment(dateRange.from)
                                    .year(year)
                                    .month(getQuarter[0])
                                    .startOf('month')
                                    .format(AKPIDateFormatEnum.US_DATE),
                                to: moment(dateRange.to)
                                    .year(year)
                                    .month(getQuarter[2])
                                    .endOf('month')
                                    .format(AKPIDateFormatEnum.US_DATE)
                            }
                        }];
                }
            }

        } else {
            switch (frequencyType) {
                case chartFrequencies.monthly:
                    switch (dateRange) {
                        case PredefinedDateRanges.allTimes:
                            return [{
                                predefined: null,
                                custom: {
                                    from: moment(category, YEAR_FORMAT)
                                        .startOf('year')
                                        .format(AKPIDateFormatEnum.US_DATE),
                                    to: moment(category, YEAR_FORMAT)
                                        .endOf('year')
                                        .format(AKPIDateFormatEnum.US_DATE)
                                }
                            }];
                        case PredefinedDateRanges.thisYear:
                        case PredefinedDateRanges.thisYearToDate:
                            return [
                                {
                                    predefined: null,
                                    custom: {
                                        from: moment(category, YEAR_FORMAT)
                                            .startOf('year')
                                            .format(AKPIDateFormatEnum.US_DATE),
                                        to: moment(category, YEAR_FORMAT)
                                            .endOf('year')
                                            .format(AKPIDateFormatEnum.US_DATE)
                                    }
                                }
                            ];
                        case PredefinedDateRanges.lastYear:
                            return [
                                {
                                    predefined: null,
                                    custom: {
                                        from: moment(category, YEAR_FORMAT)
                                            .subtract(1, 'years')
                                            .startOf('year')
                                            .format(AKPIDateFormatEnum.US_DATE),
                                        to: moment(category, YEAR_FORMAT)
                                            .subtract(1, 'years')
                                            .endOf('year')
                                            .format(AKPIDateFormatEnum.US_DATE)
                                    }
                                }
                            ];
                        case PredefinedDateRanges.lastYearToDate:
                            return [
                                {
                                    predefined: null,
                                    custom: {
                                        from: moment(category, YEAR_FORMAT)
                                            .subtract(1, 'years')
                                            .startOf('year')
                                            .format(AKPIDateFormatEnum.US_DATE),
                                        to: moment(category, YEAR_FORMAT)
                                            .endOf('day')
                                            .format(AKPIDateFormatEnum.US_DATE)
                                    }
                                }
                            ];
                        default:
                            return [
                                {
                                    predefined: null,
                                    custom: {
                                        from: moment(category, YEAR_FORMAT)
                                            .startOf('year')
                                            .format(AKPIDateFormatEnum.US_DATE),
                                        to: moment(category, YEAR_FORMAT)
                                            .endOf('year')
                                            .format(AKPIDateFormatEnum.US_DATE)
                                    }
                                }
                            ];
                    }
                case chartFrequencies.daily:
                    switch (dateRange) {
                        case PredefinedDateRanges.thisYear:
                        case PredefinedDateRanges.thisYearToDate:
                            if (year) {
                                const month = moment()
                                    .month(category)
                                    .format('MM');
                                const yearMonth = year + '-' + month;

                                return [
                                    {
                                        predefined: null,
                                        custom: {
                                            from: moment(yearMonth)
                                                .startOf('month')
                                                .format(AKPIDateFormatEnum.US_DATE),
                                            to: moment(yearMonth)
                                                .endOf('month')
                                                .format(AKPIDateFormatEnum.US_DATE)
                                        }
                                    }
                                ];
                            } else {
                                return [
                                    {
                                        predefined: null,
                                        custom: {
                                            from: moment()
                                                .month(category)
                                                .startOf('month')
                                                .format(AKPIDateFormatEnum.US_DATE),
                                            to: moment()
                                                .month(category)
                                                .endOf('month')
                                                .format(AKPIDateFormatEnum.US_DATE)
                                        }
                                    }
                                ];
                            }
                        case PredefinedDateRanges.allTimes:
                            return [{
                                predefined: null,
                                custom: {
                                    from: moment(year, YEAR_FORMAT)
                                        .month(category)
                                        .startOf('month')
                                        .format(AKPIDateFormatEnum.US_DATE),
                                    to: moment(year, YEAR_FORMAT)
                                        .month(category)
                                        .endOf('month')
                                        .format(AKPIDateFormatEnum.US_DATE)
                                }
                            }];
                        case PredefinedDateRanges.lastYear:
                            return [
                                {
                                    predefined: null,
                                    custom: {
                                        from: moment()
                                            .month(category)
                                            .subtract(1, 'years')
                                            .startOf('month')
                                            .format(AKPIDateFormatEnum.US_DATE),
                                        to: moment()
                                            .month(category)
                                            .subtract(1, 'years')
                                            .endOf('month')
                                            .format(AKPIDateFormatEnum.US_DATE)
                                    }
                                }
                            ];
                        case PredefinedDateRanges.lastYearToDate:
                            return [
                                {
                                    predefined: null,
                                    custom: {
                                        from: moment()
                                            .month(category)
                                            .subtract(1, 'years')
                                            .startOf('month')
                                            .format(AKPIDateFormatEnum.US_DATE),
                                        to: moment()
                                            .month(category)
                                            .endOf('day')
                                            .format(AKPIDateFormatEnum.US_DATE)
                                    }
                                }
                            ];
                        case PredefinedDateRanges.last2Years:
                            return [
                                {
                                    predefined: null,
                                    custom: {
                                        from: moment()
                                            .month(category)
                                            .startOf('month')
                                            .format(AKPIDateFormatEnum.US_DATE),
                                        to: moment()
                                            .month(category)
                                            .endOf('month')
                                            .format(AKPIDateFormatEnum.US_DATE)
                                    }
                                }, {
                                    predefined: null,
                                    custom: {
                                        from: moment()
                                            .month(category)
                                            .subtract(1, 'years')
                                            .startOf('month')
                                            .format(AKPIDateFormatEnum.US_DATE),
                                        to: moment()
                                            .month(category)
                                            .subtract(1, 'years')
                                            .endOf('month')
                                            .format(AKPIDateFormatEnum.US_DATE)
                                    }
                                }
                            ];
                        case PredefinedDateRanges.last3Years:
                            return [
                                {
                                    predefined: null,
                                    custom: {
                                        from: moment()
                                            .month(category)
                                            .startOf('month')
                                            .format(AKPIDateFormatEnum.US_DATE),
                                        to: moment()
                                            .month(category)
                                            .endOf('month')
                                            .format(AKPIDateFormatEnum.US_DATE)
                                    }
                                }, {
                                    predefined: null,
                                    custom: {
                                        from: moment()
                                            .month(category)
                                            .subtract(1, 'years')
                                            .startOf('month')
                                            .format(AKPIDateFormatEnum.US_DATE),
                                        to: moment()
                                            .month(category)
                                            .subtract(1, 'years')
                                            .endOf('month')
                                            .format(AKPIDateFormatEnum.US_DATE)
                                    }
                                }, {
                                    predefined: null,
                                    custom: {
                                        from: moment()
                                            .month(category)
                                            .subtract(2, 'years')
                                            .startOf('month')
                                            .format(AKPIDateFormatEnum.US_DATE),
                                        to: moment()
                                            .month(category)
                                            .subtract(2, 'years')
                                            .endOf('month')
                                            .format(AKPIDateFormatEnum.US_DATE)
                                    }
                                }
                            ];
                        case PredefinedDateRanges.last4Years:
                            return [
                                {
                                    predefined: null,
                                    custom: {
                                        from: moment()
                                            .month(category)
                                            .startOf('month')
                                            .format(AKPIDateFormatEnum.US_DATE),
                                        to: moment()
                                            .month(category)
                                            .endOf('month')
                                            .format(AKPIDateFormatEnum.US_DATE)
                                    }
                                }, {
                                    predefined: null,
                                    custom: {
                                        from: moment()
                                            .month(category)
                                            .subtract(1, 'years')
                                            .startOf('month')
                                            .format(AKPIDateFormatEnum.US_DATE),
                                        to: moment()
                                            .month(category)
                                            .subtract(1, 'years')
                                            .endOf('month')
                                            .format(AKPIDateFormatEnum.US_DATE)
                                    }
                                }, {
                                    predefined: null,
                                    custom: {
                                        from: moment()
                                            .month(category)
                                            .subtract(2, 'years')
                                            .startOf('month')
                                            .format(AKPIDateFormatEnum.US_DATE),
                                        to: moment()
                                            .month(category)
                                            .subtract(2, 'years')
                                            .endOf('month')
                                            .format(AKPIDateFormatEnum.US_DATE)
                                    }
                                }, {
                                    predefined: null,
                                    custom: {
                                        from: moment()
                                            .month(category)
                                            .subtract(3, 'years')
                                            .startOf('month')
                                            .format(AKPIDateFormatEnum.US_DATE),
                                        to: moment()
                                            .month(category)
                                            .subtract(3, 'years')
                                            .endOf('month')
                                            .format(AKPIDateFormatEnum.US_DATE)
                                    }
                                }
                            ];
                        case PredefinedDateRanges.last5Years:
                            return [
                                {
                                    predefined: null,
                                    custom: {
                                        from: moment()
                                            .month(category)
                                            .startOf('month')
                                            .format(AKPIDateFormatEnum.US_DATE),
                                        to: moment()
                                            .month(category)
                                            .endOf('month')
                                            .format(AKPIDateFormatEnum.US_DATE)
                                    }
                                }, {
                                    predefined: null,
                                    custom: {
                                        from: moment()
                                            .month(category)
                                            .subtract(1, 'years')
                                            .startOf('month')
                                            .format(AKPIDateFormatEnum.US_DATE),
                                        to: moment()
                                            .month(category)
                                            .subtract(1, 'years')
                                            .endOf('month')
                                            .format(AKPIDateFormatEnum.US_DATE)
                                    }
                                }, {
                                    predefined: null,
                                    custom: {
                                        from: moment()
                                            .month(category)
                                            .subtract(2, 'years')
                                            .startOf('month')
                                            .format(AKPIDateFormatEnum.US_DATE),
                                        to: moment()
                                            .month(category)
                                            .subtract(2, 'years')
                                            .endOf('month')
                                            .format(AKPIDateFormatEnum.US_DATE)
                                    }
                                }, {
                                    predefined: null,
                                    custom: {
                                        from: moment()
                                            .month(category)
                                            .subtract(3, 'years')
                                            .startOf('month')
                                            .format(AKPIDateFormatEnum.US_DATE),
                                        to: moment()
                                            .month(category)
                                            .subtract(3, 'years')
                                            .endOf('month')
                                            .format(AKPIDateFormatEnum.US_DATE)
                                    }
                                }, {
                                    predefined: null,
                                    custom: {
                                        from: moment()
                                            .month(category)
                                            .subtract(4, 'years')
                                            .startOf('month')
                                            .format(AKPIDateFormatEnum.US_DATE),
                                        to: moment()
                                            .month(category)
                                            .subtract(4, 'years')
                                            .endOf('month')
                                            .format(AKPIDateFormatEnum.US_DATE)
                                    }
                                }
                            ];
                        case PredefinedDateRanges.last6Months:
                            const last6MthYear = this._yearOfMonth(6);
                            return [
                                {
                                    predefined: null,
                                    custom: {
                                        from: moment(last6MthYear, YEAR_FORMAT)
                                            .month(category)
                                            .startOf('month')
                                            .format(AKPIDateFormatEnum.US_DATE),
                                        to: moment(last6MthYear, YEAR_FORMAT)
                                            .month(category)
                                            .endOf('month')
                                            .format(AKPIDateFormatEnum.US_DATE)
                                    }
                                }
                            ];
                        case PredefinedDateRanges.last3Months:
                            const last3MthYear = this._yearOfMonth(3);
                            return [
                                {
                                    predefined: null,
                                    custom: {
                                        from: moment(last3MthYear, YEAR_FORMAT)
                                            .month(category)
                                            .startOf('month')
                                            .format(AKPIDateFormatEnum.US_DATE),
                                        to: moment(last3MthYear, YEAR_FORMAT)
                                            .month(category)
                                            .startOf('month')
                                            .format(AKPIDateFormatEnum.US_DATE)
                                    }
                                }
                            ];
                        default:
                            return [{
                                predefined: null,
                                custom: {
                                    from: moment()
                                        .month(category)
                                        .startOf('month')
                                        .format(AKPIDateFormatEnum.US_DATE),
                                    to: moment()
                                        .month(category)
                                        .endOf('month')
                                        .format(AKPIDateFormatEnum.US_DATE)
                                }
                            }];
                    }
                // quarterly to monthly
                case chartFrequencies.quarterly:
                    const getQuarter = quarterMonths[category[1]];
                    switch (dateRange) {

                        case PredefinedDateRanges.allTimes:
                            const years = this._getCustomYears(parsePredefinedDate(PredefinedDateRanges.allTimes));
                            return years.map(y => {
                                return {
                                    predefined: null,
                                    custom: {
                                        from: moment(y, 'YYYY')
                                            .month(getQuarter[0])
                                            .startOf('month')
                                            .format(AKPIDateFormatEnum.US_DATE),
                                        to: moment(y, 'YYYY')
                                            .month(getQuarter[2])
                                            .endOf('month')
                                            .format(AKPIDateFormatEnum.US_DATE)
                                    }
                                };
                            });
                        case PredefinedDateRanges.thisYear:
                            return [
                                {
                                    predefined: null,
                                    custom: {
                                        from: moment()
                                            .month(getQuarter[0])
                                            .startOf('month')
                                            .format(AKPIDateFormatEnum.US_DATE),
                                        to: moment()
                                            .month(getQuarter[2])
                                            .endOf('month')
                                            .format(AKPIDateFormatEnum.US_DATE)
                                    }
                                }
                            ];
                        case PredefinedDateRanges.thisYearToDate:
                            return [
                                {
                                    predefined: null,
                                    custom: {
                                        from: moment()
                                            .month(getQuarter[0])
                                            .startOf('month')
                                            .format(AKPIDateFormatEnum.US_DATE),
                                        to: moment()
                                            .month(getQuarter[2])
                                            .endOf('day')
                                            .format(AKPIDateFormatEnum.US_DATE)
                                    }
                                }
                            ];
                        case PredefinedDateRanges.lastYear:
                            return [
                                {
                                    predefined: null,
                                    custom: {
                                        from: moment()
                                            .month(getQuarter[0])
                                            .startOf('month')
                                            .subtract(1, 'years')
                                            .format(AKPIDateFormatEnum.US_DATE),
                                        to: moment()
                                            .month(getQuarter[2])
                                            .endOf('month')
                                            .subtract(1, 'years')
                                            .format(AKPIDateFormatEnum.US_DATE)
                                    }
                                }
                            ];
                        case PredefinedDateRanges.lastYearToDate:
                            return [
                                {
                                    predefined: null,
                                    custom: {
                                        from: moment()
                                            .month(getQuarter[0])
                                            .startOf('month')
                                            .subtract(1, 'years')
                                            .format(AKPIDateFormatEnum.US_DATE),
                                        to: moment()
                                            .month(getQuarter[2])
                                            .endOf('day')
                                            .format(AKPIDateFormatEnum.US_DATE)
                                    }
                                }
                            ];
                        case PredefinedDateRanges.last2Years:
                            return [
                                {
                                    predefined: null,
                                    custom: {
                                        from: moment()
                                            .month(getQuarter[0])
                                            .startOf('month')
                                            .format(AKPIDateFormatEnum.US_DATE),
                                        to: moment()
                                            .month(getQuarter[2])
                                            .endOf('month')
                                            .format(AKPIDateFormatEnum.US_DATE)
                                    }
                                }, {
                                    predefined: null,
                                    custom: {
                                        from: moment()
                                            .month(getQuarter[0])
                                            .startOf('month')
                                            .subtract(1, 'years')
                                            .format(AKPIDateFormatEnum.US_DATE),
                                        to: moment()
                                            .month(getQuarter[2])
                                            .endOf('month')
                                            .subtract(1, 'years')
                                            .format(AKPIDateFormatEnum.US_DATE)
                                    }
                                }
                            ];
                        case PredefinedDateRanges.last3Months:
                            const last3MthYear = this._yearOfMonth(3);
                            return [
                                {
                                    predefined: null,
                                    custom: {
                                        from: moment(last3MthYear, YEAR_FORMAT)
                                            .month(getQuarter[0])
                                            .startOf('month')
                                            .format(AKPIDateFormatEnum.US_DATE),
                                        to: moment(last3MthYear, YEAR_FORMAT)
                                            .month(getQuarter[2])
                                            .endOf('month')
                                            .format(AKPIDateFormatEnum.US_DATE)
                                    }
                                }
                            ];
                        case PredefinedDateRanges.last6Months:
                            const last6MthYear = this._yearOfMonth(6);
                            return [
                                {
                                    predefined: null,
                                    custom: {
                                        from: moment(last6MthYear, YEAR_FORMAT)
                                            .month(getQuarter[0])
                                            .startOf('month')
                                            .format(AKPIDateFormatEnum.US_DATE),
                                        to: moment(last6MthYear, YEAR_FORMAT)
                                            .month(getQuarter[2])
                                            .endOf('month')
                                            .format(AKPIDateFormatEnum.US_DATE)
                                    }
                                }
                            ];
                    }
            }
        }
    }

    getDateRangeForDrillDown(currentNode: IChartTreeNode): string | IDateRange {
        const dateRange: IChartDateRange = currentNode.dateRange[0];
        const isPredefined: boolean = dateRange.predefined && dateRange.predefined !== 'custom';

        if (isPredefined) {
            return dateRange.predefined;
        }

        return dateRange.custom;
    }

    getComparisonForDrillDown(comparisonValue: string[], chartDateRange: IChartDateRange[]): string[] {
        if (!Array.isArray(chartDateRange)) {
            return [];
        }
        const isPredefined: boolean = chartDateRange[0].predefined !== 'custom';
        if (!isPredefined) {
            return [];
        }

        const dateRange: IChartDateRange = chartDateRange.find(d => d.predefined !== undefined);
        if (!dateRange) {
            return [];
        }

        const predefinedDateString: string = dateRange.predefined;
        return this._getComparisonPredefinedDateRange(predefinedDateString, comparisonValue);
    }

    private _getComparisonPredefinedDateRange(predefinedDateString: string, comparisonValue: string[]): string[] {
        const predefinedDate: string[] = [];
        comparisonValue.map(cv => {
            switch (cv) {
                case PredefinedComparisonDateRanges.custom_previousPeriod:
                    predefinedDate.push(this._previousPeriodComparisonDateRange(predefinedDateString));
                    break;
                case PredefinedComparisonDateRanges.custom_lastYear:
                    predefinedDate.push(this._lastYearComparisonDateRange(predefinedDateString));
                    break;
                case PredefinedComparisonDateRanges.custom_2YearsAgo:
                    predefinedDate.push(this._twoYearsAgoComparisonDateRange(predefinedDateString));
                    break;
                case PredefinedComparisonDateRanges.custom_3YearsAgo:
                    predefinedDate.push(this._threeYearsAgoComparisonDateRange(predefinedDateString));
                    break;
                default:
                    predefinedDate.push(this._MorethreeYearsAgoComparisonDateRange(cv));
                    break;
            }
        });
        if (!predefinedDate) {
            return [];
        }
        predefinedDate.map(pd => {
            pd = camelCase(pd);
        });
        return predefinedDate;
    }

    private _previousPeriodComparisonDateRange(predefinedDateString: string): string {
        let previousPeriodPredefinedDateRange = '';
        switch (predefinedDateString) {
            case PredefinedDateRanges.thisYear:
            case PredefinedDateRanges.thisYearToDate:
                previousPeriodPredefinedDateRange = PredefinedDateRanges.lastYear;
                break;

            case PredefinedDateRanges.lastYear:
            case PredefinedDateRanges.lastYearToDate:
                previousPeriodPredefinedDateRange = PredefinedComparisonDateRanges.custom_lastYear;
                break;

            case PredefinedDateRanges.thisMonth:
            case PredefinedDateRanges.thisMonthToDate:
            case PredefinedDateRanges.last3Months:
            case PredefinedDateRanges.last6Months:
                previousPeriodPredefinedDateRange = PredefinedComparisonDateRanges.custom_previousPeriod;
                break;

            case PredefinedDateRanges.last2Years:
                previousPeriodPredefinedDateRange = PredefinedComparisonDateRanges.customThreeYearsAgo;
                break;

            case PredefinedDateRanges.last3Years:
                previousPeriodPredefinedDateRange = PredefinedComparisonDateRanges.customFourYearsAgo;
                break;

            case PredefinedDateRanges.last4Years:
                previousPeriodPredefinedDateRange = PredefinedComparisonDateRanges.customFiveYearsAgo;
                break;
            default:
                previousPeriodPredefinedDateRange = PredefinedDateRanges.lastYear;
                break;

        }
        return previousPeriodPredefinedDateRange;
    }

    private _lastYearComparisonDateRange(predefinedDateString: string): string {
        let lastYearPredefinedDateRange = '';

        switch (predefinedDateString) {
            case PredefinedDateRanges.thisYear:
            case PredefinedDateRanges.thisYearToDate:
                lastYearPredefinedDateRange = PredefinedDateRanges.lastYear;
                break;

            case PredefinedDateRanges.lastMonth:
                lastYearPredefinedDateRange = PredefinedComparisonDateRanges.lastMonth_2YearsAgo;
                break;

            case PredefinedDateRanges.last3Months:
                lastYearPredefinedDateRange = PredefinedComparisonDateRanges.last3Months_lastYear;
                break;

            case PredefinedDateRanges.last6Months:
                lastYearPredefinedDateRange = PredefinedComparisonDateRanges.last6Months_lastYear;
                break;

            case PredefinedDateRanges.thisMonth:
            case PredefinedDateRanges.thisMonthToDate:
                lastYearPredefinedDateRange = PredefinedComparisonDateRanges.thisMonth_lastYear;
                break;

            case PredefinedDateRanges.thisQuarter:
                lastYearPredefinedDateRange = PredefinedComparisonDateRanges.thisQuarter_lastYear;
                break;
            default:
                lastYearPredefinedDateRange = PredefinedDateRanges.lastYear;
                break;
        }

        return lastYearPredefinedDateRange;
    }

    private _twoYearsAgoComparisonDateRange(predefinedDateString: string): string {
        let twoYearPredefinedDateRange = '';
        switch (predefinedDateString) {
            case PredefinedDateRanges.thisYear:
            case PredefinedDateRanges.thisYearToDate:
                twoYearPredefinedDateRange = PredefinedComparisonDateRanges.customTwoYearsAgo;
                break;
            case PredefinedDateRanges.lastYear:
                twoYearPredefinedDateRange = PredefinedComparisonDateRanges.customThreeYearsAgo;
                break;
            case PredefinedDateRanges.last3Months:
                twoYearPredefinedDateRange = PredefinedComparisonDateRanges.last3MonthsTwoYearsAgo;
                break;
            case PredefinedDateRanges.last6Months:
                twoYearPredefinedDateRange = PredefinedComparisonDateRanges.last6MonthsThreeYearsAgo;
                break;
            default:
                twoYearPredefinedDateRange = PredefinedComparisonDateRanges.customTwoYearsAgo;
                break;
        }

        return twoYearPredefinedDateRange;
    }

    private _threeYearsAgoComparisonDateRange(predefinedDateString: string): string {
        let threeYearPredefinedDateRange = '';

        switch (predefinedDateString) {
            case PredefinedDateRanges.thisYear:
            case PredefinedDateRanges.thisYearToDate:
                threeYearPredefinedDateRange = PredefinedComparisonDateRanges.customThreeYearsAgo;
                break;

            case PredefinedDateRanges.lastYear:
                threeYearPredefinedDateRange = PredefinedComparisonDateRanges.customFourYearsAgo;
                break;

            case PredefinedDateRanges.last3Months:
                threeYearPredefinedDateRange = PredefinedComparisonDateRanges.last3MonthsThreeYearsAgo;
                break;
            case PredefinedDateRanges.last6Months:
                threeYearPredefinedDateRange = PredefinedComparisonDateRanges.last6MonthsThreeYearsAgo;
                break;

            case PredefinedDateRanges.lastQuarter:
                threeYearPredefinedDateRange = PredefinedComparisonDateRanges.lastQuarterThreeYearsAgo;
                break;
            default:
                threeYearPredefinedDateRange = PredefinedComparisonDateRanges.customThreeYearsAgo;
                break;
        }

        return threeYearPredefinedDateRange;
    }
    private _MorethreeYearsAgoComparisonDateRange(predefinedDateString: string): string {
        if (predefinedDateString.includes('YearsAgo')) {
            return predefinedDateString.substr(0, predefinedDateString.indexOf('YearsAgo')) + ' years ago';
        } else if (predefinedDateString.includes('years ago')) {
            return predefinedDateString;
        }
    }
    private _yearOfMonth(minusMonth: number) {
        return moment().subtract(minusMonth, 'months').format('YYYY');
    }

    private _getCustomYears(dateRange: any): number[] {
       // const momentFormat = 'YYYY';
        const momentFormat = "DD/MM/YYYY";

        // const from = parseInt(moment(dateRange.from, momentFormat).format(momentFormat), 10);
        // const to = parseInt(moment(dateRange.to, momentFormat).format(momentFormat), 10);


        const from = moment(dateRange.from, momentFormat).year();
        const to = moment(dateRange.from, momentFormat).year();

        const diff = to - from;
        let customYears = [from, to];

        let count = 0;
        for (let i = 0; i < diff; i++) {
            count = count + from + i;
            customYears.push(count);
            count = 0;
        }

        customYears = uniq(customYears).sort();
        return customYears;
    }
}
