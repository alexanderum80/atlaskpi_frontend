import { Subscription } from 'rxjs/Subscription';
import { GenericSelectionService } from '../../services/generic-selection.service';
import { AfterViewInit, Component, HostBinding, Input, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'kpi-selectable-item-frame',
  templateUrl: './selectable-item-frame.component.pug',
  styleUrls: ['./selectable-item-frame.component.scss'],
})
export class SelectableItemFrameComponent implements OnInit, OnDestroy {
  @Input() item: any;

  selected = false;

  selectionSubscription: Subscription;

  constructor(private _selectionService: GenericSelectionService) { }

  ngOnInit() {
     this.selectionSubscription = this._selectionService.selection$.subscribe(selectedItems => {
       const exist = selectedItems.find(i => i.payload === this.item);
       if (exist) {
         this.selected = true;
         return;
       }
       this.selected = false;
    });
  }

  ngOnDestroy() {
    if (this.selectionSubscription &&
        !this.selectionSubscription.closed && (typeof this.selectionSubscription.unsubscribe === 'function')) {
      this.selectionSubscription.unsubscribe();
    }
  }

}
