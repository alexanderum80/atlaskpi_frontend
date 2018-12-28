import SweetAlert from 'sweetalert2';
import { ICustomList } from '../custom-list/custom-list-form/custom-list.viewmodel';
import { SelectionItem } from 'src/app/ng-material-components';
import { ICustomData } from './../shared/models/data-entry-form.model';
import { MenuItem } from './../../ng-material-components/models/menu-item';
import { ApolloService } from './../../shared/services/apollo.service';
import { FormArray, FormGroup, FormControl, Validators } from '@angular/forms';
import { DataEntryFormViewModel } from '../new-data-entry/data-entry.viewmodel';
import { Component, OnInit } from '@angular/core';
import { IDatePickerConfig } from '../../ng-material-components/modules/forms/date-picker/date-picker/date-picker-config.model';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { forEach, orderBy } from 'lodash';
import * as moment from 'moment';

const dataEntryIdQuery = require('graphql-tag/loader!../shared/graphql/data-entry-by-id.gql');
const customListIdQuery = require('graphql-tag/loader!../shared/graphql/get-custom-list.gql');
const updateDataEntryMutation = require('graphql-tag/loader!../shared/graphql/update-data-entry.gql');

@Component({
  selector: 'kpi-enter-data-form',
  templateUrl: './enter-data-form.component.pug',
  styleUrls: ['./enter-data-form.component.scss'],
  providers: [DataEntryFormViewModel]
})

export class EnterDataFormComponent implements OnInit {

  headerData: string[] = [];
  datePickerConfig: IDatePickerConfig;

  fieldsData: any[] = [];

  sortAscOnClic = true;

  showfilterRow = true;

  sortActionItems: MenuItem[] = [
    {
      id: '1',
      icon: 'sort-amount-asc',
      children: [
        { id: 'asc', title: 'Sort ASC', icon: 'long-arrow-up'},
        { id: 'desc', title: 'Sort DESC', icon: 'long-arrow-down'}
      ]
    }
  ];

  isLoading = true;

  dataSourceCollection: any;

  customListCollection: ICustomList[];

  private _subscription: Subscription[] = [];

  constructor(
    public vm: DataEntryFormViewModel,
    private _route: ActivatedRoute,
    private _router: Router,
    private _apolloService: ApolloService
  ) { }

  ngOnInit() {
    this._setConfigDatePicker();
    this._getDataEntryById();
    this._getCustomList();
  }

  private _getDataEntryById() {
    this._subscription.push(this._route.params.subscribe(params => {
      if (params.id) {
        this.isLoading = true;
        this._apolloService.networkQuery<string>(dataEntryIdQuery, {id: params.id}).then(res => {
          this.dataSourceCollection = JSON.parse(res.dataEntryByIdMapCollection);
          const schemaCollection = this.dataSourceCollection.schema;
          const dataCollection = this.dataSourceCollection.data;
          const dataName = this.dataSourceCollection.dataName;

          this.headerData = [];
          const fields = [];
          forEach(schemaCollection, (value, key) => {
            if (key !== 'Source') {
              fields.push({
                'columnName': key,
                'dataType': value.dataType,
                'required': value.required || false,
                'sourceOrigin': value.sourceOrigin || null
              });
            }
          });

          fields.map(s => {
            this.headerData.push(s.columnName);
          });

          this.fieldsData = fields;

          const dateRangeField = fields.findIndex(f =>
            f.columnName.toLowerCase().replace(' ', '_') === this.dataSourceCollection.dateRangeField);

          const data = [];
          dataCollection.map(d => {
            const dataElement = [];
            forEach(schemaCollection, (value, key) => {
              if (key !== 'Source') {
                let dataValue = d[value.path];
                if (value.sourceOrigin) {
                  dataValue = d[value.path].toString();
                }
                if (value.dataType === 'Date') {
                  dataValue = moment.utc(d[value.path]).format('MM/DD/YYYY');
                }
                dataElement.push(dataValue);
              }
            });
            data.push(dataElement);
          });

          const schema = {
            'schema': fields,
            'data': [],
            'dataFilter': [],
            'dataName': dataName,
            'dateRangeField': dateRangeField.toString()
          };

          this.vm.initialize(schema);

          for (let i = 0; i < data.length; i++) {
            const element = data[i];
            this._addNewRow(element);
          }

          this._addNewBlankRow();

          this._setFgValidators();

          this._addDataFilterRow(fields);

          this._subscribeToFormChanges();

          this.isLoading = false;
        });
      }
    }));
  }

  private _getCustomList() {
    this._apolloService.networkQuery<string>(customListIdQuery).then(res => {
      this.customListCollection = res.customList;
    });
  }

  private _addNewRow(data) {
    const dataFormGroup = this.vm.fg.get('data') as FormArray;

    dataFormGroup.push(new FormGroup(
      data.map(d => {
        return new FormControl(d);
      })
    ));
  }

  private _addDataFilterRow(fields) {
    const dataFormFilter = this.vm.fg.get('dataFilter') as FormArray;
    dataFormFilter.push(new FormGroup(
      fields.map(() => {
        return new FormControl('');
      })
    ));
  }

  private _setConfigDatePicker() {
    this.datePickerConfig = {
      showGoToCurrent: false,
      format: 'MM/DD/YYYY'
    };
  }

  private _addNewBlankRow() {
    const dataFormGroup = this.vm.fg.get('data') as FormArray;
    const schema = this.vm.fg.controls['schema'].value;

    dataFormGroup.push(new FormGroup(
    schema.map(() => {
        return new FormControl();
      })
    ));
  }

  private _setFgValidators() {
    const schemaFormGroup = (this.vm.fg.get('schema') as FormArray).controls;
    const dataFormGroup = (this.vm.fg.get('data') as FormArray).controls;
    for (let i = 0; i < dataFormGroup.length; i++) {
      const data = (dataFormGroup[i] as FormArray).controls;
      for (let j = 0; j < data.length; j++) {
        if (schemaFormGroup[j].value.required) {
          data[j].setValidators([Validators.required]);
        }
      }
    }
  }

  private _subscribeToFormChanges() {
    const that = this;
    this.vm.fg.controls['data'].valueChanges.subscribe(value => {
      const schemaFormGroup = this.vm.fg.controls['schema'].value;
      const totalFields = schemaFormGroup.length;
      const totalData = value.length;
      for (let d = 0; d < totalData; d++) {
        const data = value[d];

        for (let i = 0; i < totalFields; i++) {
          if (data[i] !== null && data[i] !== '') {
            const fieldData = <any>this.vm.fg.controls['data'];
            if (this.vm.isCorrectValue(schemaFormGroup[i].dataType, data[i]) === false) {
              if (fieldData.controls[d].controls[i]) {
                fieldData.controls[d].controls[i].setErrors({invalidDataType: true});
              }
            } else if (fieldData.controls[d].controls[i]) {
              fieldData.controls[d].controls[i].setErrors(null);
            }
          }
        }
      }

      const fgData = that.vm.fg.get('data') as FormArray;
      if (!fgData.controls[value.length - 1].pristine) {
        this._addNewBlankRow();
      }
    });
  }

  getPlaceholder(row, field) {
    let returnValue = '';

    const schema = <any>this.vm.fg.get('schema');
    const dataControls = <FormArray>this.vm.fg.get('data');

    if (row < dataControls.controls.length) {
      const fieldSchema = schema.controls[field].controls.dataType.value;
      switch (fieldSchema) {
        case 'Number':
          returnValue = '2500';
          break;
        case 'String':
          returnValue = 'Appliances';
          break;
        case 'Date':
          returnValue = '08/07/2018';
          break;
        case 'Boolean':
          returnValue = 'True';
          break;
      }
    }
    return returnValue;
  }

  getInputType(field) {
    if (this.fieldsData[field].sourceOrigin) {
      return 'customList';
    }
    return this.fieldsData[field].dataType;
  }

  getCustomList(field) {
    const sourceOrigin = this.fieldsData[field].sourceOrigin;
    const customListSelection: SelectionItem[] = [];
    const customList = this.customListCollection.find(f => f._id === sourceOrigin);

    customList.listValue.map(item => {
      customListSelection.push({
        id: <any>item,
        title: <any>item,
        selected: false
      });
    });
    return customListSelection;
  }

  sortDataAsc(index) {
    if (this.sortAscOnClic) {
      this.sortActionClicked(this.sortActionItems[0].children[0], index);
    }
    this.sortAscOnClic = true;
  }

  sortActionClicked(event, index) {
    const fgData = (this.vm.fg.get('data') as FormArray).controls;
    let dataArray = [];

    for (let c = 0; c < fgData.length - 1; c++) {
      const data = fgData[c];
      const dataElement = [];
      (data as FormArray).controls.map(element => {
        dataElement.push(element.value);
      });
      dataArray.push(dataElement);
    }

    (this.vm.fg.get('data') as FormArray).controls = [];
    dataArray = orderBy(dataArray, index, event.id);
    dataArray.map(data => {
      this._addNewRow(data);
    });

    this._addNewBlankRow();

    this.sortAscOnClic = false;
  }

  toogleFilterRow() {
    this.showfilterRow = !this.showfilterRow;
  }

  save() {
    const tableFields = [];
    const tableRecords = [];

    const schemaFormGroup = <any>this.vm.fg.get('schema') as FormArray;
    schemaFormGroup.controls.map(s => {
      const schema = <any>s;
      tableFields.push(schema.value);
    });

    const dataFormGroup = this.vm.fg.get('data') as FormArray;
    for (let i = 0; i < dataFormGroup.controls.length - 1; i++) {
      const controlGroup = <any>dataFormGroup.controls[i];
      const data = [];
      controlGroup.controls.map(c => {
        data.push(c.value);
      });

      tableRecords.push(data);
    }

    const tableData: ICustomData = {
      inputName: this.dataSourceCollection.dataName,
      fields: JSON.stringify(tableFields),
      records: JSON.stringify(tableRecords),
    };

    this._apolloService.mutation<any> (updateDataEntryMutation, { input: JSON.stringify(tableData) }, ['DataEntries'])
    .then(result => {
      if (result.data.updateDataEntry.success) {
        SweetAlert({
          type: 'info',
          title: 'All changes have been saved successfully',
          showConfirmButton: true,
          confirmButtonText: 'OK'});
        this._router.navigateByUrl('data-entry/show-all');
      }
    })
    .catch(err => console.log('Server errors: ' + JSON.stringify(err)));
  }

  cancel() {
    this._router.navigateByUrl('/data-entry/show-all');
  }

}
