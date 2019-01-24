import { UserService } from './../shared/services/user.service';
import { ICustomList } from './custom-list/custom-list.viewmodel';
import { DataEntryTypeEnum } from './shared/models/data-entry.models';
import { IListItem } from 'src/app/shared/ui/lists/list-item';
import { isBoolean } from 'lodash';
import { IDataType, ICustomDataInfo } from './shared/models/data-entry-form.model';
import { ICustomSchema, ICustomSchemaInfo } from './shared/models/data-entry-form.model';
import { ViewModel, Field, ArrayField } from '../ng-material-components/viewModels';
import { Injectable } from '@angular/core';
import { SelectionItem, MenuItem } from '../ng-material-components';
import { FormArray, FormGroup, FormControl } from '@angular/forms';

export class DataEntrySchemaViewModel extends ViewModel<ICustomSchemaInfo> {
    @Field({ type: String, required: true })
    columnName: string;

    @Field({ type: String, required: true })
    dataType: string;

    @Field({ type: Boolean })
    required: boolean;

    @Field({ type: String })
    sourceOrigin?: string;

    initialize(model: ICustomSchemaInfo): void {
        this.onInit(model);
    }
}

export class DataEntryDataViewModel extends ViewModel<ICustomDataInfo> {
    @Field({ type: String, required: true })
    fieldName: string;

    initialize(model: ICustomDataInfo): void {
        this.onInit(model);
    }
}

@Injectable()
export class DataEntryFormViewModel extends ViewModel<ICustomSchema> {
    private _dataType: IDataType = {
        number: 'Number',
        string: 'String' ,
        date: 'Date' ,
        boolean: 'Boolean'
    };

    dataEntryTypes: IListItem[] = [
        {
            id: DataEntryTypeEnum.UploadFile,
            imagePath: '../../../assets/img/datasources/folder.png',
            title: 'Upload File',
            subtitle: 'If you have a file in your computer'
        },
        {
            id: DataEntryTypeEnum.DefineSchema,
            imagePath: '../../../assets/img/datasources/schema.png',
            title: 'Define your schema',
            subtitle: 'Good if you have your data on paper'
        },
        {
            id: DataEntryTypeEnum.PredefinedTemplates,
            imagePath: '../../../assets/img/datasources/table.png',
            title: 'Predefined Templates',
            subtitle: 'Good for AP, AR'
        }
    ];

    selectedInputType: DataEntryTypeEnum;

    private _requiredDataType = ['Date'];

    private _requiredDataTypeLength = 2;

    private _selectedTableOption: string;

    private _customList: SelectionItem[];

    private _defaultSchema: ICustomSchema;

    private _defaultSchemaWithData: ICustomSchema;

    private _defaultInputSchema: ICustomSchema;

    private _defaultDateRangeSchema: ICustomSchema;

    private _customListSource: ICustomList[];

    private _dataCollection: any[];

    private _dataCollectionFiltered: any[];

    dateFields: MenuItem[] = [];

    private _fileExtensions = ['.csv', '.xls', '.xlsx'];

    constructor(
        private _userSvc: UserService
    ) {
        super(null);

        this._defaultSchema = {
            schema: [
                { columnName: 'Invoice amount', dataType: this._dataType.number, required: true},
                { columnName: 'Due Date', dataType: this._dataType.date, required: true },
                { columnName: 'Notes', dataType: this._dataType.string, required: false },
            ],
            data: [],
            dataName: '',
            dateRangeField: '1'
        };

        this._defaultSchemaWithData = {
            schema: [
                { columnName: 'Invoice amount', dataType: this._dataType.number, required: true},
                { columnName: 'Due Date', dataType: this._dataType.date, required: true },
                { columnName: 'Notes', dataType: this._dataType.string, required: false },
            ],
            data: [
                ['2500.00', '10/20/2017',  'Appliances'],
                ['8700.00', '10/30/2017',  'Employee Checks'],
                ['130.00', '10/20/2017',  'Transportation'],
            ],
            dataName: '',
            dateRangeField: '1'
        };

        this._defaultInputSchema = {
            schema : [
                { columnName: '', dataType: this._dataType.number, required: true, sourceOrigin: undefined },
                { columnName: '', dataType: this._dataType.date, required: true, sourceOrigin: undefined },
                { columnName: '', dataType: this._dataType.string, required: false, sourceOrigin: undefined },
            ],
            data: [],
            dataName: '',
            dateRangeField: '1'
        };

        this._customList = [
            { id: 'Number', title: 'Numeric', selected: false },
            { id: 'String', title: 'String', selected: false },
            { id: 'Date', title: 'Date', selected: false },
            { id: 'Boolean', title: 'Boolean', selected: false },
        ];

        this.selectedInputType = DataEntryTypeEnum.None;
    }

    @ArrayField({ type: DataEntrySchemaViewModel })
    schema: DataEntrySchemaViewModel[];

    @ArrayField({ type: DataEntryDataViewModel })
    data: DataEntryDataViewModel[];

    @ArrayField({ type: DataEntryDataViewModel })
    dataFilter: DataEntryDataViewModel[];

    @Field({ type: String, required: true })
    dataName: string;

    @Field({ type: String })
    dateRangeField: string;

    initialize(model: ICustomSchema): void {
        this.onInit(model);
    }

    getDefaultSchema() {
        return this._defaultSchema;
    }

    getDefaultSchemaWithData() {
        return this._defaultSchemaWithData;
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

    setCustomListSource(source) {
        this._customListSource = source;
    }

    get customListSource() {
        return this._customListSource;
    }

    get customList() {
        return this._customList;
    }

    setSelectedTableOption(selectedOption) {
        this._selectedTableOption = selectedOption;
    }

    getSelectedTableOption() {
        return this._selectedTableOption;
    }

    dataEntryPermission() {
        return this._userSvc.hasPermission('Assign User to', 'DataEntry');
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

    get fileExtensions() {
        return this._fileExtensions;
    }

    downloadToCsvFile(collectionName, fields, dataArray) {
        const replacer = (key, value) => value === null ? '' : value; // specify how you want to handle null values here
        const header = Object.values(fields);
        const csv = dataArray.map(row => row.map(value => JSON.stringify(value, replacer)).join(','));
        csv.unshift(header.join(','));
        const csvArray = csv.join('\r\n');

        const a = document.createElement('a');
        const blob = new Blob([csvArray], {type: 'text/csv' }),
        url = window.URL.createObjectURL(blob);

        a.href = url;
        a.download = collectionName + '.csv';
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
    }


    setDataCollection(data) {
        this._dataCollection = data;
    }

    get dataCollection() {
        return this._dataCollection;
    }

    setDataCollectionFiltered(data) {
        this._dataCollectionFiltered = data;
    }

    get dataCollectionFiltered() {
        return this._dataCollectionFiltered;
    }

}

