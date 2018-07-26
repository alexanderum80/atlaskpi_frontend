import { isBoolean, find } from 'lodash';
import { IDataType, ICustomDataInfo } from './../shared/models/data-sources/custom-form.model';
import { ICustomSchema, ICustomSchemaInfo } from '../shared/models/data-sources/custom-form.model';
import { ViewModel, Field, ArrayField } from '../../ng-material-components/viewModels';
import { Injectable } from '@angular/core';
import { SelectionItem } from '../../ng-material-components';


export class CustomSchemaViewModel extends ViewModel<ICustomSchemaInfo> {

    @Field({ type: String, required: true })
    columnName: string;

    @Field({ type: String, required: true })
    dataType: string;

    initialize(model: ICustomSchemaInfo): void {
        this.onInit(model);
    }
}

export class CustomDataViewModel extends ViewModel<ICustomDataInfo> {

    @Field({ type: String, required: true })
    fieldName: string;

    initialize(model: ICustomDataInfo): void {
        this.onInit(model);
    }
}

@Injectable()
export class CustomFormViewModel extends ViewModel<ICustomSchema> {
    private _dataType: IDataType = {
        numeric: 'Numeric',
        string: 'String' ,
        date: 'Date' ,
        boolean: 'Boolean'
    };

    private _requiredDataType = ['Numeric', 'String', 'Date'];

    private _selectedTableOption: string;

    private _dataTypeList: SelectionItem[];

    private _defaultSchema: ICustomSchema;

    private _defaultInputSchema: ICustomSchema;

    Alphabet = [
        'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
    ];

    constructor() {
        super(null);

        this._defaultSchema = {
            schema: [
                { columnName: 'Amount', dataType: this._dataType.numeric },
                { columnName: 'Transaction Date', dataType: this._dataType.date },
                { columnName: 'Description', dataType: this._dataType.string },
            ],
            data: [],
        };

        this._defaultInputSchema = {
            schema : [
                { columnName: '', dataType: this._dataType.numeric },
                { columnName: '', dataType: this._dataType.date },
                { columnName: '', dataType: this._dataType.string },
            ],
            data: []
        };

        this._dataTypeList = [
            { id: 'Numeric', title: 'Numeric', selected: false },
            { id: 'String', title: 'String', selected: false },
            { id: 'Date', title: 'Date', selected: false },
            { id: 'Boolean', title: 'Boolean', selected: false },
        ];
    }

    @ArrayField({ type: CustomSchemaViewModel })
    schema: CustomSchemaViewModel[];

    @ArrayField({ type: CustomDataViewModel })
    data: CustomDataViewModel[];

    initialize(model: ICustomSchema): void {
        this.onInit(model);
    }

    getDefaultSchema() {
        return this._defaultSchema;
    }

    getDefaultInputSchema() {
        return this._defaultInputSchema;
    }

    getDataType() {
        return this._dataType;
    }

    get dataTypeList() {
        return this._dataTypeList;
    }

    setSelectedTableOption(selectedOption) {
        this._selectedTableOption = selectedOption;
    }

    getSelectedTableOption() {
        return this._selectedTableOption;
    }

    isCorrectValue(dataType, value) {
        let isCorrectValue = true;
        switch (dataType) {
          case 'Numeric':
            if (isNaN(+value)) {
              isCorrectValue = false;
            }
            break;
          case 'Date':
            if (isNaN(Date.parse(value))) {
              isCorrectValue = false;
            }
            break;
          case 'Boolean':
            if (!isBoolean(value)) {
              isCorrectValue = false;
            }
            break;
        }
        return isCorrectValue;
    }

    getDataTypeFromValue(value) {
        let dataType: string;

        if (!isNaN(+value)) {
            dataType = 'Numeric';
        } else if (!isNaN(Date.parse(value))) {
            dataType = 'Date';
        } else if (isBoolean(value)) {
            dataType = 'Boolean';
        } else {
            dataType = 'String';
        }
        return dataType;
    }

    isRequiredDataTypePresent(dataTypeArray) {
        let dataTypePresent = true;
        this._requiredDataType.map(o => {
            const data = dataTypeArray.find(d => d.dataType === o);
            if (!data) {
                dataTypePresent = false;
            }
        });

        return dataTypePresent;
    }
}

