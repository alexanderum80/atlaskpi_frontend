import { ApolloService } from './../../../shared/services/apollo.service';
import { FormGroup } from '@angular/forms';
import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { IDatePickerConfig } from 'src/app/ng-material-components/modules/forms/date-picker/date-picker/date-picker-config.model';
import { SelectionItem } from 'src/app/ng-material-components';
import * as moment from 'moment';

const getCustomListQuery = require('graphql-tag/loader!../../shared/graphql/get-custom-list.gql');

@Component({
  selector: 'kpi-define-schema-details',
  templateUrl: './define-schema-details.component.pug',
  styleUrls: ['./define-schema-details.component.scss']
})
export class DefineSchemaDetailsComponent implements OnInit, OnChanges {

  @Input() schema: FormGroup;
  @Input() customList;
  @Input() selectedNewList;

  datePickerConfig: IDatePickerConfig;
  dataTypeUpdated = false;
  selectedList: SelectionItem[] = [];

  constructor(private _apolloService: ApolloService) { }

  ngOnInit() {
    this._subscribeToFormChange();
    this.datePickerConfig = {
      showGoToCurrent: false,
      format: 'MM/DD/YYYY'
    };
  }

  ngOnChanges() {
    if (this.schema.controls['dataType'].value === 'createList') {
      this.selectedList = this.selectedNewList;
    }
  }

  private _subscribeToFormChange() {
    this.schema.get('dataType').valueChanges.subscribe(fg => {
        this.dataTypeUpdated = true;
    });
    this.schema.valueChanges.subscribe(value => {
      if (this.dataTypeUpdated === false) { return; }
      if (value.dataType === 'Date') {
        value.defaultValue = undefined;
      } else if (value.dataType === 'Number') {
        value.defaultValue = 0;
      } else if (value.dataType === 'Boolean') {
        value.defaultValue = false;
      } else if (value.dataType === 'String') {
        value.defaultValue = undefined;
      } else if (value.dataType !== 'Date' && value.dataType !== 'Number' && value.dataType !== 'Boolean'
              && value.dataType !== 'String' && value.dataType !== 'createList') {
        this._apolloService.networkQuery<any>(getCustomListQuery).then(res => {
          const listValues = res.customList.find(c => c._id === value.dataType).listValue;
          this.selectedList = listValues.map(v => {
            return {
              id: v,
              title: v,
              selected: false,
              disabled: false
            };
          });
        });
      }
      this.dataTypeUpdated = false;
    });
  }

}
