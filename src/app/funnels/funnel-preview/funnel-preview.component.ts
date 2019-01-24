import { Component, OnInit, Input } from '@angular/core';
import { IFunnel } from '../shared/models/funnel.model';
import { IRenderedFunnel, IRenderedFunnelStage } from '../shared/models/rendered-funnel.model';

const sampleFunnel: IRenderedFunnel = {
  _id: '1',
  name: 'Inquires to Surgery Pipeline',
  stages: [
    {
      _id: '1',
      order: 1,
      name: 'Inquires',
      count: 100,
      amount: 1000000,
      foreground: '#fff',
      background: '#FF3D00',
    },
    {
      _id: '2',
      order: 2,
      name: 'Scheduled Consults',
      count: 60,
      amount: 350000,
      foreground: '#fff',
      background: '#FF6F00',
    },
    {
      _id: '3',
      order: 3,
      name: 'Completed Consults',
      count: 50,
      amount: 320000,
      foreground: '#fff',
      background: '#FFC107',
    },
    {
      _id: '4',
      order: 4,
      name: 'Scheduled Surgeries',
      count: 33,
      amount: 320000,
      foreground: '#fff',
      background: '#4CAF50',
      compareToStageName: 'Completed Consults',
      compareToStageValue: 65
    },
    {
      _id: '5',
      order: 5,
      name: 'Completed Surgeries',
      count: 30,
      amount: 192000,
      foreground: '#fff',
      background: '#304FFE',
      compareToStageName: 'Completed Consults',
      compareToStageValue: 60
    },
  ]
};

function sum(prev: number, next: number) { return prev + next; }

@Component({
  selector: 'kpi-funnel-preview',
  templateUrl: './funnel-preview.component.pug',
  styleUrls: ['./funnel-preview.component.scss']
})
export class FunnelPreviewComponent implements OnInit {
    @Input() renderedFunnel: IRenderedFunnel = sampleFunnel;
    @Input() width = 400;
    @Input() height = 400;

    constructor() { }

    ngOnInit() {
    }

    calcStageHeight(stage: IRenderedFunnelStage): number {
        const total = this.renderedFunnel.stages
          .map(s => s.amount)
          .reduce(sum);

        return Math.round(stage.amount * this.height / total);
    }



}
