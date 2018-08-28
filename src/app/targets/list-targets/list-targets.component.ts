import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';

import { IActionItemClickedArgs } from '../../shared/ui/lists/item-clicked-args';
import { ListTargetsViewModel } from './list-targets.viewmodel';
import { ITargetNew } from '../shared/models/targets.model';
import { IListItem } from '../../shared/ui/lists/list-item';
import { ApolloService } from '../../shared/services/apollo.service';
import SweetAlert from 'sweetalert2';

const targesDelete = require('graphql-tag/loader!./delete-target.gql');

@Component({
  selector: 'kpi-list-targets',
  templateUrl: './list-targets.component.pug',
  styleUrls: ['./list-targets.component.scss'],
  providers: [ListTargetsViewModel]
})
export class ListTargetsComponent implements OnInit {
  @Input() chart: any;
  // @Input() widget: any;
  @Input() targets: ITargetNew[];
  // responsive input
  @Input() xsSize = 100;
  @Input() smSize = 25;
  @Input() xlSize = 20;

  @Output() selectItem = new EventEmitter<any>();
  @Output() addItem = new EventEmitter<any>();
  @Output() onDelete = new EventEmitter<string>();

  item: IListItem;
  
  constructor(public vml: ListTargetsViewModel,
              private _apolloService: ApolloService) {}

  ngOnInit() {
    const that = this;

    if (!that.vml.initialized) {
      that.vml.initialize(null);
    }
    this.vml.targets = this.targets;
  }

  itemClicked(item) {
      this.vml.selectTarget(item);
      this.item = item;
      this.selectItem.emit(item);
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

  add() {
    this.vml.unSelectTarget();
    this.addItem.emit();
  }

  editClickedList(item: IActionItemClickedArgs) {

  }

  getTargets(targets) {
    this.vml.targets = targets;
  }

  private disable(item) {

  }

  private delete(item) {
    const that = this;

        SweetAlert({
                title: 'Are you sure?',
                text: `Once target's location has been deleted, you will not be able to recover it. Are you sure you want to delete it?`,
                type: 'warning',
                showConfirmButton: true,
                showCancelButton: true
            })
            .then((res) => {
                if (res.value === true) {
                  this._apolloService.mutation < ITargetNew > (targesDelete, {'id': item })
                  .then(res => {
                    this.onDelete.emit(item);
                  })
                  .catch(err => {
                      this._displayServerErrors(err) ;
                  });
                }
            });

  }

  private _displayServerErrors(err) {
    console.log('Server errors: ' + JSON.stringify(err));
  }

}
