import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'kpi-call-rail-accountid-tooltip',
  templateUrl: './call-rail-accountid-tooltip.component.pug',
  styleUrls: ['./call-rail-accountid-tooltip.component.scss']
})
export class CallRailAccountidTooltipComponent implements OnInit {
  @Output() closeAccountIdToolTip = new EventEmitter();
  imgPath = '../../../assets/img/callrail_accountId_url.png';

  constructor() { }

  ngOnInit() {
  }

  closeToolTip() {
    this.closeAccountIdToolTip.emit(true);
  }

}
