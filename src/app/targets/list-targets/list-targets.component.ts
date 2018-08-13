import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { IActionItemClickedArgs } from '../../shared/ui/lists/item-clicked-args';
import { ITarget } from '../shared/models/targets.model';
import { ListTargetsViewModel } from './list-targets.viewmodel';



@Component({
  selector: 'kpi-list-targets',
  templateUrl: './list-targets.component.pug',
  styleUrls: ['./list-targets.component.scss'],
  providers: [ListTargetsViewModel]
})
export class ListTargetsComponent implements OnInit {

  // responsive input
  @Input() xsSize = 100;
  @Input() smSize = 25;
  @Input() xlSize = 20;

  private _subscription: Subscription[] = [];

  private _targets: ITarget[] = [{
      _id: '1',
      name: 'Target Name',
      objetive: 'string',
      value: 0,
      period: 'string',
      baseOn: 'string',
      repeat: 'string',
      active: true,
      nextDueDate: 'Next due date',
      relatedUser: {
        user: 'current',
        email: 'email',
        phone: '01254122'
      },
      milestone: {
        description: '',
        completetionDate: '',
        responsiblePeople: '',
        status: ''
      }

    },
    {
      _id: '2',
      name: 'Target 1',
      objetive: 'string',
      value: 0,
      period: 'string',
      baseOn: 'string',
      repeat: 'string',
      active: true,
      nextDueDate: 'Next due date',
      relatedUser: {
        user: 'current',
        email: 'email',
        phone: '01254122'
      },
      milestone: {
        description: '',
        completetionDate: '',
        responsiblePeople: '',
        status: ''
      }
    }
  ];


  constructor(public vm: ListTargetsViewModel) {}

  ngOnInit() {
    const that = this;

    if (!that.vm.initialized) {
      that.vm.initialize(null);
      that.vm.targets = that._targets;
    }

  }

  add() {

  }

  itemClicked(e, item) {
      this.vm.selectTarget(item);
  }


  actionClicked(item: IActionItemClickedArgs) {
    switch (item.action.id) {
      case 'edit':
        this.disable(item.item.id);
        break;
      case 'delete':
        this.delete(item.item.id);
        break;
    }
  }

  editClickedList(item: IActionItemClickedArgs) {

  }

  private disable(item) {

  }

  private delete(item) {

  }



}
