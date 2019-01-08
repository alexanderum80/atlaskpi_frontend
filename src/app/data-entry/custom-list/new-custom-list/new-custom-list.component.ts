import { UserService } from './../../../shared/services/user.service';
import { FormArray, FormGroup, FormControl } from '@angular/forms';
import SweetAlert from 'sweetalert2';
import { ApolloService } from 'src/app/shared/services/apollo.service';
import { CustomListFormViewModel, ICustomList } from '../custom-list.viewmodel';
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

  private _currentUser: string;

  constructor(
    private vm: CustomListFormViewModel,
    private _apolloService: ApolloService,
    private _userSvc: UserService
  ) {
  }

  ngOnInit() {
    this.currentUser();
  }

  currentUser(): any {
    this._userSvc.user$.subscribe(user => {
      if (user) {
        this._currentUser = user._id;
      }
    });
  }

  open() {
    this.newCustomListModal.open();
    this.vm.fg.controls.name.setValue('');
    this.vm.fg.controls.dataType.setValue('String');
    this.vm.customListModel.controls = [];
    this.vm.customListModel.push(new FormGroup({
      value: new FormControl('')
    }));
  }

  save() {
    const payload = this.vm.payload;
    payload['users'] = [this._currentUser];

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
          this._closeModal();
          this.newCustomListId.emit(res.data.addCustomList.entity);
        }
      });
    });
  }

  cancel() {
    this._closeModal();
    const emptyPayload: ICustomList = {
      _id: '',
      name: null,
      dataType: 'string',
      listValue: []
    };
    this.newCustomListId.emit(emptyPayload);
  }

  private _closeModal() {
    this.newCustomListModal.close();
  }

}
