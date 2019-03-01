import * as moment from 'moment';

export interface IRawColumns {
    path: string;
    name: string;
    type: string;
}

export interface IGridColumnOptions {
    replaceNullNumbersWithZero?: boolean;
    displayStringArrayWithComma?: boolean;
}

export class AgGridService {

    public prepareColumns(rawColumns: IRawColumns[], options?: IGridColumnOptions) {
        return rawColumns.map(r => ({
            headerName: r.name,
            field: r.path,
            filter: this._getColumnFilter(r.type),
            valueFormatter: (params) => this._getValueFormatter(params, r.type, options),
            type:  this._getColumnType(r.type)
        }));
    }

    private _getColumnFilter(dataType: string) {
        switch (dataType) {
            case 'String':
                return 'agTextColumnFilter';
            case 'Number':
                return 'agNumberColumnFilter';
            case 'Date':
                return 'agDateColumnFilter';
            case 'Boolean':
                return true;
            default:
                break;
        }
    }

    private _getValueFormatter(params: any, type: string,  options?: IGridColumnOptions) {
        const {replaceNullNumbersWithZero = false } = options;

        let value;

        switch (type) {
            case 'Number':
                value = params.value;
                if (replaceNullNumbersWithZero && !value) { value = 0; }

                if (value === undefined || value === null) { return null; }
                return Number(value).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});

            case 'Date':
                    value = params.value;

                    if (!value || !moment(value).isValid()) { return value; }
                    return moment(value).format('M/DD/YYYY');

            default:
                return params.value;
        }
    }

    private _getColumnType(type: string) {
        switch (type) {
            case 'Number':
                return  'numericColumn';
            default:
                return;
        }
    }

}
