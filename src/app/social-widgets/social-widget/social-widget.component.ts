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

  swidgetSelected = false;
  selectionSubscription: Subscription;
  fgSwidget: FormGroup;
  fgPatched = false;

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
        if (!this.fgPatched) {
          this.fgSwidget.patchValue(fgValue);
          this.fgPatched = true;
        }
        this.swidgetSelected = true;
        if (exist.position === 0) {
          this.fgSwidget.controls['position'].setErrors({invalidDataType: true});
        } else {
          if (!exist.validPosition) {
            this.fgSwidget.controls['position'].setErrors({forbiddenName: true});
          } else {
            this.fgSwidget.controls['position'].setErrors(null);
          }
        }
      } else {
        this.swidgetSelected = false;
        this.fgPatched = false;
      }
   });
   this.fgSwidget.valueChanges.subscribe(value => {
    if (isNaN(value.position) || value.position === '') {
      this.changePosition(0);
    } else {
      if (this.fgPatched) {
        this.changePosition(value.position);
      } else {
        this.fgPatched = true;
      }
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
    const itemChange = { id: this.socialWidget.connectorId, type: 'sw', position: parseInt(event, 0) };
    this._selectionService.updateItemPosition(itemChange);
  }

  onClickPosition() {
    this._selectionService.allowDisableSelection = false;
  }
}
