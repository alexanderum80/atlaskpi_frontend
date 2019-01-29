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
  @Output() validPosition = new EventEmitter<boolean>(true);

  mapSelected = false;
  selectionSubscription: Subscription;
  fgMap: FormGroup;
  previousPositionValue = 0;


  constructor(private _selectionService: GenericSelectionService) { }

  ngOnInit() {
    this.fgMap = new FormGroup({
      'position': new FormControl(''),
    });
    this.selectionSubscription = this._selectionService.selection$.subscribe(selectedItems => {
      const exist = selectedItems.find(i => i.id === this.item._id);
      if (exist) {
        const fgValue = {
          position: exist.position
        };
        this.previousPositionValue = exist.position;
        this.fgMap.patchValue(fgValue);
        this.mapSelected = true;
      } else {
        this.mapSelected = false;
      }
   });
   this.fgMap.valueChanges.subscribe(value => {
    if (isNaN(value.position)) {
      this.fgMap.controls['position'].setErrors({invalidDataType: true});
      this.validPosition.emit(false);
      return;
    }
    // Here I must validate duplicated position value
    const duplicatedPos = this._selectionService._selectionList.find(s => s.type === 'map'
    && s.position === parseInt(value.position, 0) && s.payload.size === this.item.size
    && s.id !== this.item._id);
    if (duplicatedPos) {
      this.fgMap.controls['position'].setErrors({forbiddenName: true});
      this.validPosition.emit(false);
    } else {
      this.validPosition.emit(true);
      this.changePosition(value.position);
      this.previousPositionValue = value.position;
    }
   });
  }

  changePosition(event) {
    const itemChange = { id: this.item._id, position: parseInt(event, 0) };
    this._selectionService.updateItemPosition(itemChange);
  }

  onClickPosition() {
    this._selectionService.allowDisableSelection = false;
  }

  lostFocusPosition() {
    if (this.fgMap.controls['position'].errors) {
      const fgValue = { position: this.previousPositionValue };
      this.fgMap.patchValue(fgValue);
    }
  }

}
