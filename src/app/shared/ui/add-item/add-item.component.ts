import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'kpi-add-item',
  templateUrl: './add-item.component.pug',
  styleUrls: ['./add-item.component.scss']
})
export class AddItemComponent {
  @Input() itemViewModel?: any;
  @Input() addItemActivityName?: string;
  @Output() onItemClicked = new EventEmitter();

  addItem() {
    this.onItemClicked.emit();
  }

  get isDisabled() {
    if (!this.itemViewModel || !this.addItemActivityName) { return false; }
    return !this.itemViewModel.authorizedTo(this.addItemActivityName);
  }

}
