import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'kpi-call-rail-apikey-tooltip',
  templateUrl: './call-rail-apikey-tooltip.component.pug',
  styleUrls: ['./call-rail-apikey-tooltip.component.scss']
})
export class CallRailApikeyTooltipComponent implements OnInit {
  @Output() closeApiKeyToolTip = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

  closeToolTip() {
    this.closeApiKeyToolTip.emit(true);
  }

}
