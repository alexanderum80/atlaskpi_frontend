import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { FormGroup, FormControl } from '@angular/forms';
import { GenericSelectionService } from '../../shared/services/generic-selection.service';

@Component({
  selector: 'kpi-auto-renderable-map',
  templateUrl: './auto-renderable-map.component.pug',
  styleUrls: ['./auto-renderable-map.component.scss']
})
export class AutoRenderableMapComponent implements OnInit {
  @Input() item: any;

  mapSelected = false;
  selectionSubscription: Subscription;
  fgMap: FormGroup;
  fgPatched = false;


  constructor(private _selectionService: GenericSelectionService) { }

  ngOnInit() {
    this.fgMap = new FormGroup({
      'position': new FormControl(''),
    });
    this.selectionSubscription = this._selectionService.selection$.subscribe(selectedItems => {
      const exist = selectedItems.find(i => i.id === this.item._id && i.type === 'map'
      && i.payload.size === this.item.size);
      if (exist) {
        const fgValue = {
          position: exist.position
        };
        if (!this.fgPatched) {
          this.fgMap.patchValue(fgValue);
          this.fgPatched = true;
        }
        this.mapSelected = true;
        if (exist.position === 0) {
          this.fgMap.controls['position'].setErrors({invalidDataType: true});
        } else {
          if (!exist.validPosition) {
            this.fgMap.controls['position'].setErrors({forbiddenName: true});
          } else {
            this.fgMap.controls['position'].setErrors(null);
          }
        }
      } else {
        this.mapSelected = false;
      }
   });
   this.fgMap.valueChanges.subscribe(value => {
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

  changePosition(event) {
    const itemChange = { id: this.item._id, type: 'map', size: this.item.size , position: parseInt(event, 0) };
    this._selectionService.updateItemPosition(itemChange);
  }

  onClickPosition() {
    this._selectionService.allowDisableSelection = false;
  }
}
