import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'kpi-collapsable',
  templateUrl: './collapsable.component.pug',
  styleUrls: ['./collapsable.component.scss']
})
export class CollapsableComponent implements OnInit {
  @Input() collapsed = false;
  @Input() headerText = '';
  @Input() headerTextExpanded = '';
  @Input() color = '';
  @Input() enableShadow = true;
  @Input() marginBottom = '';
  @Output() collapsedChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  changeValue() {
    this.collapsed = !this.collapsed;
    this.collapsedChange.emit(this.collapsed);
  }
  constructor() { }

  ngOnInit() {
  }
}
