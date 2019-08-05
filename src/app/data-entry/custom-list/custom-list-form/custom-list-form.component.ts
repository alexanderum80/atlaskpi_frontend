import SweetAlert from 'sweetalert2';
import { forEach } from 'lodash';
import { ApolloService } from './../../../shared/services/apollo.service';
import { SelectionItem } from './../../../ng-material-components/models/selection-item';
import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { CustomListFormViewModel, ICustomList } from '../custom-list.viewmodel';
import { FormArray, FormGroup, FormControl } from '@angular/forms';

const dataEntryCollectionQuery = require('graphql-tag/loader!../../shared/graphql/data-entry-collection.gql');

@Component({
  selector: 'kpi-custom-list-form',
  templateUrl: './custom-list-form.component.pug',
  styleUrls: ['./custom-list-form.component.scss'],
})
export class CustomListFormComponent implements OnInit, OnChanges {
  @Input() customList: ICustomList;

  dataTypeItems: SelectionItem[];

  private _dataEntry: any[];

  constructor(
    public vm: CustomListFormViewModel,
    private _apolloService: ApolloService
  ) {}

  ngOnInit() {
    this.dataTypeItems = [
      { id: 'String', title: this.vm.dataTypeItems.string, selected: true },
      { id: 'Number', title: this.vm.dataTypeItems.number, selected: false }
    ];
    this.vm.customListModel = this.vm.fg.get('listValue') as FormArray;

    if (!(this.vm.fg.get('listValue') as FormArray).controls.length) {
      this.vm.customListModel.push(
        new FormGroup({ value: new FormControl('')})
      );
    }
    this._subscribeToFormChange();
    this._getDataEntryCollection();
  }

  ngOnChanges() {
    if (!this.customList) {
      this.customList = this.vm.defaultCustomListModel;
    }
    const fgValue = {
      _id: this.customList._id,
      name: this.customList.name,
      dataType: this.customList.dataType,
      listValue: []
    };
    this.customList.listValue.map(c => {
      fgValue.listValue.push({
        value: <any>c
      });
    });
    fgValue.listValue.push({
      value: ''
    });

    if (!this.vm.initialized) {
      this.vm.initialize(fgValue);
    } else {
      this.vm.fg.patchValue(fgValue);
      this.vm.customListModel.controls = [];
      fgValue.listValue.map(lv => {
        this.vm.customListModel.push(new FormGroup({
            value: new FormControl(lv.value)
          })
        );
      });
    }
  }

  private _subscribeToFormChange() {
    this.vm.customListModel.valueChanges.subscribe(fg => {
      if (fg.length && !this.vm.customListModel.controls[fg.length - 1].pristine && this.vm.customListModel.controls[fg.length - 1].value) {
        this._insertBlank();
      }
      for (let i = 0; i < fg.length - 1; i++) {
        if (!fg[i].value) {
          this.vm.customListModel.controls[i].setErrors({required: true});
        } else {
          this.vm.customListModel.controls[i].setErrors(null);
        }
      }
    });
  }

  private async _getDataEntryCollection() {
    await this._apolloService.networkQuery < any[] > (dataEntryCollectionQuery).then(data => {
      this._dataEntry = JSON.parse(data.dataEntryCollection);
    });
  }

  private _insertBlank() {
    this.vm.customListModel.push(new FormGroup({
      value: new FormControl('')
    }));
  }

  removeListItem(customList: FormGroup) {
    if (!customList) {
        return;
    }

    let customListInUse = false;
    if (this.customList._id) {
      for (let i = 0; i < this._dataEntry.length; i++) {
        const element = this._dataEntry[i];
        forEach(element.schema, (value, key) => {
          if (value.sourceOrigin) {
            element.data.map(data => {
              if (data[value.path] === customList.value.value) {
                customListInUse = true;
              }
            });
          }
        });
      }
    }

    if (customListInUse) {
      return SweetAlert({
        title: 'Value in use!',
        text: `This value cannot be deleted because it's in use.`,
        type: 'error',
        showConfirmButton: true,
        confirmButtonText: 'Ok'
      });
    } else {
      const customListIndex = this.vm.customListModel.controls.findIndex(c => c === customList);

      if (customListIndex > -1) {
          this.vm.customListModel.removeAt(customListIndex);
      }
    }
  }

}
