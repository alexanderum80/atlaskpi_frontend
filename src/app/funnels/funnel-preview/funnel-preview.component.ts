import { Component, OnInit, Input } from '@angular/core';
import { IFunnel } from '../shared/models/funnel.model';
import { IRenderedFunnel } from '../shared/models/rendered-funnel.model';

@Component({
  selector: 'kpi-funnel-preview',
  templateUrl: './funnel-preview.component.pug',
  styleUrls: ['./funnel-preview.component.scss']
})
export class FunnelPreviewComponent implements OnInit {
  @Input() renderedFunnel: IRenderedFunnel;

  constructor() { }

  ngOnInit() {
  }

}
