import { SelectionItem } from '../../../ng-material-components/models';

export interface IArithmeticOperator {
    symbol: string;
    name: string;
}

export const ArithmeticOperators: IArithmeticOperator[] = [
    {
        symbol: '+',
        name: 'Add',
    },
    {
        symbol: '-',
        name: 'Substract',
    },
    {
        symbol: '*',
        name: 'Multiply'
    },
    {
        symbol: '/',
        name: 'Divide'
    }
];

export function getArithmeticOperatorItems(): SelectionItem[] {
    return ArithmeticOperators.map(o => new SelectionItem(o.symbol, `${o.name} ( ${o.symbol} )`));
}

export interface IKPILogicOperator {
    id: Number;
    symbol: string;
    name: string;
    type?: string[];
    control?: string;
}

export const KPILogicOperatorCollection: IKPILogicOperator[] = [
    {
        id: 1,
        symbol: 'eq',
        name: 'Equal',
        type: ['String', 'Number', 'Boolean'],
        control: 'single-selector'
    },
    {
        id: 2,
        symbol: 'ne',
        name: 'Not Equal',
        type: ['String', 'Number', 'Boolean'],
        control: 'single-selector'
    },
    {
        id: 3,
        symbol: 'gt',
        name: 'Greater than',
        type: ['Number'],
        control: 'textbox'
    },
    {
        id: 4,
        symbol: 'gte',
        name: 'Greater than or equal',
        type: ['Number'],
        control: 'textbox'
    },
    {
        id: 5,
        symbol: 'lt',
        name: 'Less than',
        type: ['Number'],
        control: 'textbox'
    },
    {
        id: 6,
        symbol: 'lte',
        name: 'Less than or equal',
        type: ['Number'],
        control: 'textbox'
    },
    {
        id: 7,
        symbol: 'in',
        name: 'In',
        type: ['String', 'Number'],
        control: 'multi-selector'
    },
    {
        id: 8,
        symbol: 'nin',
        name: 'Nor in',
        type: ['String', 'Number'],
        control: 'multi-selector'
    },
    {
        id: 9,
        symbol: 'startWith',
        name: 'Starts with',
        type: ['String'],
        control: 'textbox'
    },
    {
        id: 10,
        symbol: 'endWith',
        name: 'Ends With',
        type: ['String'],
        control: 'textbox'
    },
    {
        id: 11,
        symbol: 'contains',
        name: 'Contains',
        type: ['String'],
        control: 'textbox'
    },
    {
        id: 12,
        symbol: 'regex',
        name: 'Regex',
        type: ['String'],
        control: 'textbox'
    },
    {
        id: 13,
        symbol: 'eq',
        name: 'Equal',
        type: ['Date'],
        control: 'datepicker'
    },
    {
        id: 14,
        symbol: 'ne',
        name: 'Not Equal',
        type: ['Date'],
        control: 'datepicker'
    },
    {
        id: 15,
        symbol: 'gt',
        name: 'Greater than',
        type: ['Date'],
        control: 'datepicker'
    },
    {
        id: 16,
        symbol: 'gte',
        name: 'Greater than or equal',
        type: ['Date'],
        control: 'datepicker'
    },
    {
        id: 17,
        symbol: 'lt',
        name: 'Less than',
        type: ['Date'],
        control: 'datepicker'
    },
    {
        id: 18,
        symbol: 'lte',
        name: 'Less than or equal',
        type: ['Date'],
        control: 'datepicker'
    },
];
