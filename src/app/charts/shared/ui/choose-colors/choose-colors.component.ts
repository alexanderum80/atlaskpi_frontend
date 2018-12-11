import { FormGroup } from '@angular/forms';
import { Colors } from './../chart-format-info/material-colors';
import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { SelectionItem, ModalComponent } from '../../../../ng-material-components';

@Component({
  selector: 'kpi-choose-colors',
  templateUrl: './choose-colors.component.pug',
  styleUrls: ['./choose-colors.component.scss']
})
export class ChooseColorsComponent implements OnInit {

  @Input() fg: FormGroup;
  @Output() colorChoosed = new EventEmitter<any>();
  @ViewChild('selectIntensityModal') selectModal: ModalComponent;

  colorsItems = Colors;
  intensityDefaultValue = 'default';
  intensityList: SelectionItem[] = [];
  themeColors: any[];


  constructor() { }

  ngOnInit() {
    this._getIntensityList();
    this._subscribeToIntesityValueChange();
  }

  private _getIntensityList() {
    this.colorsItems.map(color => {
      this.intensityList.push({
        id: color.intensity,
        title: color.intensity,
        selected: false,
        disabled: false
      });
    });
  }

  private _subscribeToIntesityValueChange() {
    const that = this;
    this.fg.valueChanges.subscribe(value => {
      if (value.intensity) {
        that.themeColors = that.colorsItems.filter(c => c.intensity === value.intensity);
      }
    });
  }

  onSelectColor(color) {
    this.colorChoosed.emit(color);
    this.selectModal.close();
  }

  open() {
    this.selectModal.open();
  }
}
