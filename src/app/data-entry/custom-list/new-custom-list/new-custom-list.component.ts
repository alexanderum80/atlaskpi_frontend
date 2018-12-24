import { FormArray, FormGroup, FormControl } from '@angular/forms';
import SweetAlert from 'sweetalert2';
import { ApolloService } from 'src/app/shared/services/apollo.service';
import { CustomListFormViewModel, ICustomList } from '../custom-list-form/custom-list.viewmodel';
import { Component, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
import { ModalComponent } from 'src/app/ng-material-components';

const customListByNameQuery = require('graphql-tag/loader!../../shared/graphql/custom-list-by-name.gql');
const addNewCustomListMutation = require('graphql-tag/loader!../../shared/graphql/add-custom-list.gql');

@Component({
  selector: 'kpi-new-custom-list',
  templateUrl: './new-custom-list.component.pug',
  styleUrls: ['./new-custom-list.component.scss']
})
export class NewCustomListComponent implements OnInit {
  @ViewChild('newCustomListModal') newCustomListModal: ModalComponent;
  @Output() newCustomListId = new EventEmitter<ICustomList>();

  constructor(
    private vm: CustomListFormViewModel,
    private _apolloService: ApolloService
  ) {
  }

  ngOnInit() {
    // this.vm.initialize(this.vm.defaultCustomListModel);
  }

  open() {
    this.newCustomListModal.open();
    this.vm.fg.controls.name.setValue('');
    this.vm.fg.controls.dataType.setValue('');
    this.vm.customListModel.controls = [];
    this.vm.customListModel.push(new FormGroup({
      value: new FormControl('')
    }));
    // if (!(this.vm.fg.controls.listValue as FormArray).controls.length) {
    // }
  }

  save() {
    const payload = this.vm.payload;

    this._apolloService.networkQuery<any>(customListByNameQuery, { name: payload.name }).then(list => {
      if (list.customListByName) {
        return SweetAlert({
          title: 'List name exists!',
          text: `Already exists list with name: '${payload.name}'. Please change the list name.`,
          type: 'error',
          showConfirmButton: true,
          confirmButtonText: 'Ok'
        });
      }
      this._apolloService.mutation<any>(addNewCustomListMutation, { input: payload }).then(res => {
        if (res.data.addCustomList.success) {
          this.newCustomListId.emit(res.data.addCustomList.entity);
          this._closeModal();
        }
      });
    });
  }

  cancel() {
    const emptyPayload: ICustomList = {
      _id: '',
      name: null,
      dataType: 'string',
      listValue: []
    };
    this.newCustomListId.emit(emptyPayload);
    this._closeModal();
  }

  private _closeModal() {
    // this._initializeModel();
    this.newCustomListModal.close();
  }

  private _initializeModel() {
    this.vm.initialize(this.vm.defaultCustomListModel);
    this.vm.customListModel.controls.push(new FormGroup({
      value: new FormControl('')
    }));
  }

}
