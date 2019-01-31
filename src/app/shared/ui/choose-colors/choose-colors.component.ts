import { FormGroup } from '@angular/forms';
import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { ModalComponent } from '../../../ng-material-components';
import { Colors } from '../../models/material-colors';

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
  themeColors: any[];
  currentPage = 1;


  constructor() { }

  ngOnInit() {
    this.filterColorsPage(this.currentPage);
  }

  filterColorsPage(page: number) {
    this.themeColors = this.colorsItems.filter(c => c.page === page);
  }

  onSelectColor(color) {
    this.colorChoosed.emit(color);
    this.selectModal.close();
  }

  open() {
    this.selectModal.open();
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage = this.currentPage - 1;
      this.filterColorsPage(this.currentPage);
    }
  }

  nextPage() {
    if (this.currentPage >= 1) {
      this.currentPage = this.currentPage + 1;
      this.filterColorsPage(this.currentPage);
    }
  }
}
