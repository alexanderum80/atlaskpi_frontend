import { ModalComponent } from './../../../ng-material-components/modules/user-interface/modal/modal.component';
import { Apollo, QueryRef } from 'apollo-angular';
import { ICustomData } from '../../shared/models/data-entry-form.model';
import Sweetalert from 'sweetalert2';
import { IUserInfo } from '../../../shared/models/user';
import { UserService } from '../../../shared/services/user.service';
import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { DataEntryFormViewModel } from '../../data-entry.viewmodel';
import { Router } from '@angular/router';
import { SelectionItem } from 'src/app/ng-material-components';
import { NewCustomListComponent } from '../../custom-list/new-custom-list/new-custom-list.component';
import { Subscription } from 'rxjs';
import { ICustomList, CustomListFormViewModel } from '../../custom-list/custom-list.viewmodel';

const allUserQuery = require('graphql-tag/loader!../../shared/graphql/get-all-users.gql');
const dataSourceByNameQuery = require('graphql-tag/loader!../../shared/graphql/data-source-by-name.query.gql');
const addDataEntryMutation = require('graphql-tag/loader!../../shared/graphql/add-data-entry.gql');

@Component({
  selector: 'kpi-predefined-template',
  templateUrl: './predefined-template.component.pug',
  styleUrls: ['./predefined-template.component.scss']
})
export class PredefinedTemplateComponent implements OnInit {
  @ViewChild('predefinedTemplateModal') predefinedTemplateModal: ModalComponent;

  schemas: FormArray;
  defaultDateRangeField: number;

  usersList: [{
    _id: string;
    fullName: string;
    pictureUrl: string
    selected: boolean;
  }];

  currentUser: IUserInfo;
  customList: SelectionItem[] = [];

  customListOptions: SelectionItem[] = [
    { id: 'selectionList', title: 'Selection List', disabled: true },
    { id: 'createList', title: ' + Create List', disabled: false }
  ];

  subscription: Subscription[] = [];

  lisOfCustomListQuery: QueryRef<any>;

  currentStep = 1;

  constructor(
    public vm: DataEntryFormViewModel,
    private _apollo: Apollo,
    private _userService: UserService,
    private _router: Router
  ) {
    this.vm.initialize(this.vm.getDefaultSchema());
    this.schemas = vm.fg.get('schema') as FormArray;
    this.defaultDateRangeField = this.vm.fg.controls.schema.value.findIndex(f => f.dataType === 'Date');
  }

  ngOnInit() {
    this._getCurrentUser();
    this._getAllUsers();
    this.predefinedTemplateModal.open();
  }

  private _getCurrentUser() {
    this._userService.user$
      .distinctUntilChanged()
      .subscribe((user: IUserInfo) => {
          this.currentUser = user;
      });
  }

  private _getAllUsers() {
      this._apollo.query({ query: allUserQuery, fetchPolicy: 'network-only' }).subscribe(({data}) => {
        this.usersList = (<any>data).allUsers.map(u => {
          return {
            _id: u._id,
            fullName: u.profile.firstName + ' ' + u.profile.lastName,
            pictureUrl: u.profilePictureUrl,
            selected: this.currentUser._id === u._id ? true : false
          };
        });
      });
  }

  isFormValid() {
    const selectedUsers = this.usersList ? this.usersList.filter(u => u.selected === true) : [];
    return this.vm.fg.controls['dataName'].value !== '' && selectedUsers.length;
  }

  updateUserSelection(selected, index) {
    this.usersList[index].selected = selected;
  }

  downloadTemplate() {
    const defaultSchema = this.vm.getDefaultSchemaWithData();
    const fields = defaultSchema.schema.map(f => f.columnName);
    const data = defaultSchema.data;
    const collectionName = 'sample';
    this.vm.downloadToCsvFile(collectionName, fields, data);
  }

  enterData() {
    this.currentStep = 2;
  }

  goBack() {
    this.currentStep = 1;
  }

  save() {
    const tableFields = [];
    const tableRecords = [];

    const schemaFormGroup = <any>this.vm.fg.get('schema') as FormArray;
    schemaFormGroup.controls.map(s => {
      const schema = <any>s;
      tableFields.push(schema.value);
    });

    const dataFormGroup = this.vm.fg.get('data') as FormArray;
    dataFormGroup.controls.map(d => {
      const controlGroup = <any>d;
      const data = [];
      controlGroup.controls.map(c => {
        data.push(c.value);
      });

      tableRecords.push(data);
    });

    const selectedUsers = this.usersList.filter(f => f.selected).map(u => {
      return u._id;
    });

    const tableData: ICustomData = {
      inputName: this.vm.fg.controls['dataName'].value,
      fields: JSON.stringify(tableFields),
      records: JSON.stringify(tableRecords),
      dateRangeField: tableFields[this.vm.fg.controls['dateRangeField'].value].columnName,
      users: selectedUsers
    };

    this._apollo.query<any>({
      query: dataSourceByNameQuery,
      fetchPolicy: 'network-only',
      variables: { name: tableData.inputName }
    })
      .toPromise()
      .then(res => {
        if (res.data.dataSourceByName) {
          return Sweetalert({
            title: 'Data name exists!',
            text: `Already exists data with name: '${tableData.inputName}'. Please change the data name.`,
            type: 'error',
            showConfirmButton: true,
            confirmButtonText: 'Ok'
          });
        }
        this._apollo.mutate<any> ({
          mutation: addDataEntryMutation,
          variables: { input: tableData },
          refetchQueries: ['DataEntries']})
        .toPromise()
        .then(result => {
          const resultData = result.data.addDataEntry || null;
          if (resultData) {
            this._router.navigate(['data-entry', 'enter-data', resultData._id]);
          }
        })
        .catch(err => console.log('Server errors: ' + JSON.stringify(err)));
      })
      .catch(err => console.log('Server errors: ' + JSON.stringify(err)));
  }

  cancel() {
    this.predefinedTemplateModal.close();
    this.vm.selectedInputType = 0;
  }

}
