import { SelectionItem } from '../../ng-material-components';
import { roundWithDecimals } from '../extentions';

export enum FormatEnum {
    Undefined,
    None,
    Percent,
    Dollar,
    Libra,
    Euro,
}

export function getFormatPropName(format: FormatEnum) {
    switch (format) {
        case FormatEnum.None:
            return 'percent';
        case FormatEnum.Percent:
            return 'percent';
        case FormatEnum.Dollar:
            return 'dollar';
        case FormatEnum.Dollar:
            return 'dollar';
        case FormatEnum.Libra:
            return 'libra';
        case FormatEnum.Euro:
            return 'euro';
    }
}

const FormatsMap  = {
    none: {
        format: '{{v}}',
        sample: '12.3456',
        decimals: 8
    },
    percent: {
        format: '{{v}}%',
        sample: '12.34%',
        decimals: 2
    },
    dollar: {
        format: '${{v}}',
        sample: '$1,234.00',
        decimals: 2
    },
    libra: {
        format: '£{{v}}',
        sample: '£1,234.00',
        decimals: 2
    },
    euro: {
        format: '€{{v}}',
        sample: '€1,234.00',
        decimals: 2
    }
};

export class ValueFormatHelper {
    public static ApplyFormat(value: string, formatId: string, toLocalString = true): string {
        const format = FormatsMap[formatId];

        if (isNaN(Number(value)) || !format.hasOwnProperty('decimals') || format.decimals === null) {
            return FormatsMap[formatId].format.replace('{{v}}', value);
        }

        const rounded = roundWithDecimals(Number(value), format.decimals);
        return FormatsMap[formatId].format.replace('{{v}}', toLocalString ? rounded.toLocaleString() : rounded);
    }

    public static GetFormatSelectionList(): SelectionItem[] {
        return Object.keys(FormatsMap).map(key => {
            return {
                id: key,
                title: FormatsMap[key].sample,
                selected: false,
                disabled: false
            };
        });
    }
}
