import { Apollo, QueryRef } from 'apollo-angular';
import { ICustomData } from './../../shared/models/data-entry-form.model';
import Sweetalert from 'sweetalert2';
import { IUserInfo } from './../../../shared/models/user';
import { UserService } from './../../../shared/services/user.service';
import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { DataEntryFormViewModel } from '../../data-entry.viewmodel';
import { Router } from '@angular/router';
import { SelectionItem } from 'src/app/ng-material-components';
import { NewCustomListComponent } from '../../custom-list/new-custom-list/new-custom-list.component';
import { Subscription } from 'rxjs';
import { ICustomList, CustomListFormViewModel } from '../../custom-list/custom-list.viewmodel';
import { union } from 'lodash';

const allUserQuery = require('graphql-tag/loader!../../shared/graphql/get-all-users.gql');
const getCustomListQuery = require('graphql-tag/loader!../../shared/graphql/get-custom-list.gql');
const updateCustomListMutation = require('graphql-tag/loader!../../shared/graphql/update-custom-list.gql');
const dataSourceByNameQuery = require('graphql-tag/loader!../../shared/graphql/data-source-by-name.query.gql');
const addDataEntryMutation = require('graphql-tag/loader!../../shared/graphql/add-data-entry.gql');

@Component({
  selector: 'kpi-define-schema',
  templateUrl: './define-schema.component.pug',
  styleUrls: ['./define-schema.component.scss']
})
export class SchemaFormComponent implements OnInit {
  @ViewChild(NewCustomListComponent) newCustomListComponent: NewCustomListComponent;

  schemas: FormArray;
  defaultDateRangeField: number;
  isCollapsedSchema = false;
  isCollapsedAssignUser = true;

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

  lastInsertedCustomList: ICustomList;

  constructor(
    public vmData: DataEntryFormViewModel,
    private vmListForm: CustomListFormViewModel,
    private _apollo: Apollo,
    private _userService: UserService,
    private _router: Router
  ) {
    this.vmData.initialize(this.vmData.getDefaultInputSchema());
    this.vmListForm.initialize(this.vmListForm.defaultCustomListModel);
    this.schemas = vmData.fg.get('schema') as FormArray;
    this.defaultDateRangeField = this.vmData.fg.controls.schema.value.findIndex(f => f.dataType === 'Date');
  }

  async ngOnInit() {
    this._getCurrentUser();
    this._getAllUsers();
    await this._getCustomList();
    this._subscribeToFormChange();
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

  private _getCustomList() {
    this.lisOfCustomListQuery = this._apollo.watchQuery<any>({
      query: getCustomListQuery,
      fetchPolicy: 'network-only'
    });

    this.subscription.push(this.lisOfCustomListQuery.valueChanges.subscribe(res => {
      this.vmData.setCustomListSource(res.data.customList);
      // load default custom list
      this.customList = [];
      this.vmData.customList.map(list => {
        this.customList.push({
          id: list.id,
          title: list.title,
          selected: false,
          disabled: list.disabled
        });
      });

      // add list header
      this.customList.push({
        id: this.customListOptions[0].id,
        title: this.customListOptions[0].title,
        selected: false,
        disabled: this.customListOptions[0].disabled
      });

      // add personal list
      this.vmData.customListSource.map(data => {
      this.customList.push({
            id: data._id,
            title: ' > ' + data.name,
            selected: false,
            disabled: false
        });
      });

      // add create list option
      this.customList.push({
        id: this.customListOptions[1].id,
        title: this.customListOptions[1].title,
        selected: false,
        disabled: this.customListOptions[1].disabled
      });

      if (this.lastInsertedCustomList) {
        const insertedCustomList = this.vmData.customListSource.find(list => list.name === this.lastInsertedCustomList.name);
        this.schemas.controls[this.vmListForm.newCustomListIndex].get('dataType').patchValue(
          insertedCustomList ? insertedCustomList._id : this.lastInsertedCustomList._id, { emitEvent: false }
        );

        this.lastInsertedCustomList = undefined;
      }
    }));
  }

  private _subscribeToFormChange() {
    this.schemas.valueChanges.subscribe(fg => {
      debugger;
      fg.map(value => {
        if (value.dataType === 'createList') {
          this.vmListForm.newCustomListIndex = this.schemas.controls.findIndex(f => f.value === value);
          this.newCustomListComponent.open();
        }
      });
    });
  }

  addSchema(): void {
    const that = this;
    that.schemas.push(new FormGroup({}) as any);
  }

  removeSchema(schema: FormGroup) {
      if (!schema) {
          return;
      }

      const schemaIndex = this.schemas.controls.findIndex(c => c === schema);

      if (schemaIndex > -1) {
          this.schemas.removeAt(schemaIndex);
      }
  }

  moreThanOneDateField(schema: FormGroup) {
    const schemaIndex = this.schemas.controls.findIndex(c => c === schema);
    const currentSchema = this.schemas.controls[schemaIndex];

    const dateFields = this.schemas.controls.filter(f => f.value.dataType === 'Date');

    if (currentSchema.value.dataType === 'Date' && dateFields.length > 1) {
      return true;
    } else {
      return false;
    }
  }

  isFormValid() {
    const selectedUsers = this.usersList ? this.usersList.filter(u => u.selected === true) : [];
    const dateFields = this.vmData.fg.get('schema').value.filter(f => f.dataType === 'Date');
    return this.vmData.fg.controls['dataName'].value !== '' && selectedUsers.length && dateFields.length;
  }

  updateUserSelection(selected, index) {
    this.usersList[index].selected = selected;
  }

  save() {
    const tableFields = [];
    const tableRecords = [];

    const schemaFormGroup = <any>this.vmData.fg.get('schema') as FormArray;
    schemaFormGroup.controls.map(s => {
      const schema = <any>s;
      tableFields.push(schema.value);
    });

    const dataFormGroup = this.vmData.fg.get('data') as FormArray;
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
      inputName: this.vmData.fg.controls['dataName'].value,
      fields: JSON.stringify(tableFields),
      records: JSON.stringify(tableRecords),
      dateRangeField: tableFields[this.vmData.fg.controls['dateRangeField'].value].columnName,
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
            debugger;
            const customList = this.vmData.customListSource;
            const sourceOrigin = customList.filter(list => {
              const customListField = tableFields.find(f => f.dataType === list._id);
              if (customListField) {
                return list;
              }
            });
            if (sourceOrigin.length) {
              sourceOrigin.forEach(list => {
                this._updateCustomListUsers(list, selectedUsers).then(() => {
                  this._router.navigate(['data-entry', 'enter-data', resultData._id]);
                });
              });
            } else {
              this._router.navigate(['data-entry', 'enter-data', resultData._id]);
            }
          }
        })
        .catch(err => console.log('Server errors: ' + JSON.stringify(err)));
      })
      .catch(err => console.log('Server errors: ' + JSON.stringify(err)));
  }

  cancel() {
    this._router.navigateByUrl('/data-entry/show-all');
  }

  private _updateCustomListUsers(customList, users): Promise<Object[]> {
    return new Promise((resolve, reject) => {
      users = union(users, customList.users);

      const inputValue = {
        _id: customList._id,
        name: customList.name,
        dataType: customList.dataType,
        listValue: customList.listValue,
        users: users
      };

      this._apollo.mutate<any>({
        mutation: updateCustomListMutation,
        variables: {input: inputValue}
      })
      .toPromise()
      .then(res => {
        resolve(res.data.updateCustomList);
        return;
      });
    });
  }

  selectNewCustomList(list) {
    debugger;
    this.lastInsertedCustomList = list;
    this.lisOfCustomListQuery.refetch().then(() => this._getCustomList());
  }

}
