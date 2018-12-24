import { CustomListFormViewModel } from '../custom-list-form/custom-list.viewmodel';
import { ICustomList } from '../custom-list-form/custom-list.viewmodel';
import SweetAlert from 'sweetalert2';
import { Component, OnInit, Input, Output, EventEmitter, AfterViewInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ApolloService } from 'src/app/shared/services/apollo.service';

const deleteCustomListMutation = require('graphql-tag/loader!../../shared/graphql/remove-custom-list.gql');

@Component({
  selector: 'kpi-custom-list-summary',
  templateUrl: './custom-list-summary.component.pug',
  styleUrls: ['./custom-list-summary.component.scss']
})
export class CustomListSummaryComponent implements OnInit, AfterViewInit {
  @Input() customList: ICustomList;
  @Input() index = 0;
  @Output() selectedCustomListIndex = new EventEmitter<number>();

  fg: FormGroup;

  constructor(
    public vm: CustomListFormViewModel,
    private _apolloService: ApolloService
  ) { }

  ngOnInit() {
    // this._subscribeToFormChange();
  }

  ngAfterViewInit() {
    // if (this.customList) {
    //   const fgValue = {
    //     _id: this.customList._id,
    //     name: this.customList.name,
    //     dataType: this.customList.dataType,
    //     listValue: this.customList.listValue
    //   };
    //   this.vm.fg.patchValue(fgValue);
    // } else {
    //   this.vm.fg.patchValue(this.vm.defaultCustomListModel);
    // }
  }

  updateSelectedCustomList(customListIndex) {
    this.selectedCustomListIndex.emit(customListIndex);
  }

  removeCustomList(customListId) {
    SweetAlert({
      type: 'warning',
      title: 'Are you sure?',
      text: 'Once deleted, you will not be able to recover this personal list',
      showConfirmButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'Cancel',
    }).then(result => {
      if (result.value === true) {
        this._apolloService.mutation<any> (deleteCustomListMutation, { id: customListId }, ['CustomList'])
          .then(res => {
            if (res.data.removeCustomList.success) {
              this.selectedCustomListIndex.emit(0);
              this.vm.removeCustomList(customListId);
            }
          });
      }
    });
  }

  get customListDescription() {
    const description = this.customList.listValue.join(', ') || '';
    return description;
  }

  // private _subscribeToFormChange() {
  //   this.fg.valueChanges.subscribe(fg => {
  //     if (fg.active !== undefined && fg.active !== '') {
  //       this.switchedActive.emit(fg.active);
  //     }
  //   });
  // }

}
