import { SelectionItem } from '../../../ng-material-components/models';

const aggregateFunctions: SelectionItem[] = [
    { id: 'sum', title: 'SUM' },
    { id: 'max', title: 'MAX' },
    { id: 'min', title: 'MIN' },
    { id: 'avg', title: 'AVG' },
    { id: 'count', title: 'COUNT' }
];

export const getAggregateFunctions = (): SelectionItem[] => [...aggregateFunctions];
