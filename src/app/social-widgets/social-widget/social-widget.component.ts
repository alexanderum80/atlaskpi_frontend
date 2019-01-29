import { FormGroup, FormControl } from '@angular/forms';
import { GenericSelectionService } from './../../shared/services/generic-selection.service';
import { Component, Input, Output , OnInit, EventEmitter } from '@angular/core';

import { SocialWidgetBase } from '../models/social-widget-base';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'kpi-social-widget',
  templateUrl: './social-widget.component.pug',
  styleUrls: ['./social-widget.component.scss'],
})
export class SocialWidgetComponent implements OnInit {
  @Input() socialWidget: SocialWidgetBase;
  @Input() isFromDashboardEdit = false;
  @Output() validPosition = new EventEmitter<boolean>(true);

  swidgetSelected = false;
  selectionSubscription: Subscription;
  fgSwidget: FormGroup;
  previousPositionValue = 0;

  constructor(private _selectionService: GenericSelectionService) { }

  ngOnInit() {
    if (!this.isFromDashboardEdit) { return; }
    this.fgSwidget = new FormGroup({
      'position': new FormControl(''),
    });
    this.selectionSubscription = this._selectionService.selection$.subscribe(selectedItems => {
      const exist = selectedItems.find(i => i.id === this.socialWidget.connectorId);
      if (exist) {
        const fgValue = {
          position: exist.position
        };
        this.previousPositionValue = exist.position;
        this.fgSwidget.patchValue(fgValue);
        this.swidgetSelected = true;
      } else {
        this.swidgetSelected = false;
      }
   });
   this.fgSwidget.valueChanges.subscribe(value => {
    if (isNaN(value.position)) {
      this.fgSwidget.controls['position'].setErrors({invalidDataType: true});
      this.validPosition.emit(false);
      return;
    }
    // Here I must validate duplicated position value
    const duplicatedPos = this._selectionService._selectionList.find(s => s.type === 'sw'
    && s.position === parseInt(value.position, 0) && s.id !== this.socialWidget.connectorId);
    if (duplicatedPos) {
      this.fgSwidget.controls['position'].setErrors({forbiddenName: true});
      this.validPosition.emit(false);
    } else {
      this.validPosition.emit(true);
      this.changePosition(value.position);
      this.previousPositionValue = value.position;
    }
   });
  }

  mainValue(): string {
    return Number(this.socialWidget.value).toLocaleString();
  }

  historicalValue(): string {
    if (!this.socialWidget.historicalData) { return; }
    return Number(this.socialWidget.historicalData.value).toLocaleString();
  }

  arrow(): string {
      if (!this.socialWidget.historicalData ||
          this.socialWidget.value === this.socialWidget.historicalData.value)  {
        return;
      }

      return Number(this.socialWidget.value) > Number(this.socialWidget.historicalData.value)
             ? 'up'
             : 'down';
  }

  hasValue(): boolean {
    return this.socialWidget.value !== null && this.socialWidget.value !== undefined ;
  }

  changePosition(event) {
    const itemChange = { id: this.socialWidget.connectorId, position: parseInt(event, 0) };
    this._selectionService.updateItemPosition(itemChange);
  }

  onClickPosition() {
    this._selectionService.allowDisableSelection = false;
  }

  lostFocusPosition() {
    if (this.fgSwidget.controls['position'].errors) {
      const fgValue = { position: this.previousPositionValue };
      this.fgSwidget.patchValue(fgValue);
    }
  }
}
