import { Component, OnInit, Input } from '@angular/core';
import { IActionItemClickedArgs } from '../../shared/ui/lists/item-clicked-args';
import { ListTargetsViewModel } from './list-targets.viewmodel';
import { Subscription } from 'rxjs';
import { ITargets, IRelatedUser } from '../shared/models/targets.model';
import { now } from 'moment';



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

  private _targets: ITargets[] = [{
    _id: '1',
    name: 'Target Name',
    objetive: 'string',
    value: 0,
    period: 'string',
    baseOn: 'string',
    repeat: 'string',
    active: true,
    nextDueDate:  'Next due date',
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

} , 
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
}]; 

  
  constructor(public vm: ListTargetsViewModel) {  }

  ngOnInit() {
    const that = this;

    if (!that.vm.initialized) {
       that.vm.initialize(null);
       that.vm.targets = that._targets;
    }

    // this._subscription.push(this._route.queryParams.subscribe(p => {
    //     if (p.refresh) {
    //         // that._refreshEmployees();
    //     }
    // }));

  }

  add() {

  }

  itemClicked() {

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

  private delete(item){

  }

  

}
