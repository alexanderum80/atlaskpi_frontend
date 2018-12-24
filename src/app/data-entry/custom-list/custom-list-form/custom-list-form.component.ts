import { SelectionItem } from './../../../ng-material-components/models/selection-item';
import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { CustomListFormViewModel, ICustomList } from './custom-list.viewmodel';
import { FormArray, FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'kpi-custom-list-form',
  templateUrl: './custom-list-form.component.pug',
  styleUrls: ['./custom-list-form.component.scss'],
})
export class CustomListFormComponent implements OnInit, OnChanges {
  @Input() customList: ICustomList;

  dataTypeItems: SelectionItem[];


  constructor(
    public vm: CustomListFormViewModel
  ) {
    this.dataTypeItems = [
      { id: 'String', title: vm.dataTypeItems.string, selected: true },
      { id: 'Number', title: vm.dataTypeItems.number, selected: false }
    ];
    this.vm.customListModel = this.vm.fg.get('listValue') as FormArray;
  }

  ngOnInit() {
    if (!(this.vm.fg.get('listValue') as FormArray).controls.length) {
      this.vm.customListModel.push(
        new FormGroup({ value: new FormControl('')})
      );
    }
    this._subscribeToFormChange();
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

    const customListIndex = this.vm.customListModel.controls.findIndex(c => c === customList);

    if (customListIndex > -1) {
        this.vm.customListModel.removeAt(customListIndex);
    }
  }

}
