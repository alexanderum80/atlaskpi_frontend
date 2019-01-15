import { isBoolean, find } from 'lodash';
import { IDataType, ICustomDataInfo } from '../shared/models/data-sources/custom-form.model';
import { ICustomSchema, ICustomSchemaInfo } from '../shared/models/data-sources/custom-form.model';
import { ViewModel, Field, ArrayField } from '../../ng-material-components/viewModels';
import { Injectable } from '@angular/core';
import { SelectionItem, MenuItem } from '../../ng-material-components';
import { BehaviorSubject, Observable } from 'rxjs';


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
        number: 'Number',
        string: 'String' ,
        date: 'Date' ,
        boolean: 'Boolean'
    };

    private _selectedInputType = 'import';

    private _currentStep = 1;

    private _isEditSubject = new BehaviorSubject<boolean>(false);

    private _requiredDataType = ['Date'];

    private _requiredDataTypeLength = 2;

    private _selectedTableOption: string;

    private _dataTypeList: SelectionItem[];

    private _defaultSchema: ICustomSchema;

    private _defaultInputSchema: ICustomSchema;

    private _defaultDateRangeSchema: ICustomSchema;


    Alphabet = [
        'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
    ];

    dateFields: MenuItem[] = [];

    private _fileExtensions = ['.csv', '.xls', '.xlsx'];

    constructor() {
        super(null);

        this._defaultSchema = {
            schema: [
                { columnName: 'Invoice amount', dataType: this._dataType.number},
                { columnName: 'Due Date', dataType: this._dataType.date },
                { columnName: 'Notes', dataType: this._dataType.string },
            ],
            data: [],
            dataName: '',
            dateRangeField: '1'
        };

        this._defaultInputSchema = {
            schema : [
                { columnName: '', dataType: this._dataType.number },
                { columnName: '', dataType: this._dataType.date },
                { columnName: '', dataType: this._dataType.string },
            ],
            data: [],
            dataName: '',
            dateRangeField: '1'
        };

        this._dataTypeList = [
            { id: 'Number', title: 'Numeric', selected: false },
            { id: 'String', title: 'String', selected: false },
            { id: 'Date', title: 'Date', selected: false },
            { id: 'Boolean', title: 'Boolean', selected: false },
        ];

        this._isEditSubject.subscribe(value => {
            if (!value) {
                this._currentStep = 1;
            } else {
                this._currentStep = 3;
            }
        });
    }

    @ArrayField({ type: CustomSchemaViewModel })
    schema: CustomSchemaViewModel[];

    @ArrayField({ type: CustomDataViewModel })
    data: CustomDataViewModel[];

    @Field({ type: String })
    dataName: string;

    @Field({ type: String })
    dateRangeField: string;

    initialize(model: ICustomSchema): void {
        this.onInit(model);
    }

    getDefaultSchema() {
        return this._defaultSchema;
    }

    getDefaultInputSchema() {
        return this._defaultInputSchema;
    }

    getDefaultDateRangeSchema() {
        return this._defaultDateRangeSchema;
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
          case 'Number':
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
        if (value === null || value === '') {
            dataType = 'String';
        } else if (isBoolean(value) || value === '0' || value === '1') {
            dataType = 'Boolean';
        } else if (!isNaN(+value)) {
            dataType = 'Number';
        } else if (!isNaN(Date.parse(value))) {
            dataType = 'Date';
        } else {
            dataType = 'String';
        }
        return dataType;
    }

    isRequiredDataTypePresent(dataTypeArray) {
        let dataTypePresent = true;
        this._requiredDataType.map(o => {
            const data = dataTypeArray.find(d => d.dataType === o);
            if (!data || dataTypeArray.length < this._requiredDataTypeLength) {
                dataTypePresent = false;
            }
        });

        return dataTypePresent;
    }

    updateSelectedInputType(inputType) {
        this._selectedInputType = inputType;
    }

    get selectedInputType() {
        return this._selectedInputType;
    }

    updateCurrentStep(step) {
        this._currentStep = step;
    }

    get currentStep() {
        return this._currentStep;
    }

    get isEdit$(): Observable<boolean> {
        return this._isEditSubject;
    }

    updateIsEdit(value) {
        this._isEditSubject.next(value);
    }

    get fileExtensions() {
        return this._fileExtensions;
    }
}

