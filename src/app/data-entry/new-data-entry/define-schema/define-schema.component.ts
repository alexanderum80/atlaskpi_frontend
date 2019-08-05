import { cloneDeep } from 'apollo-utilities';
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
import { union, forEach, map } from 'lodash';
import { InvalidRowsPopupComponent } from '../import-file/invalid-rows-popup/invalid-rows-popup.component';

const allUserQuery = require('graphql-tag/loader!../../shared/graphql/get-all-users.gql');
const getCustomListQuery = require('graphql-tag/loader!../../shared/graphql/get-custom-list.gql');
const updateCustomListMutation = require('graphql-tag/loader!../../shared/graphql/update-custom-list.gql');
const dataSourceByNameQuery = require('graphql-tag/loader!../../shared/graphql/data-source-by-name.query.gql');
const addDataEntryMutation = require('graphql-tag/loader!../../shared/graphql/add-data-entry.gql');
const updateSchemaMutation = require('graphql-tag/loader!../../shared/graphql/update-virtualsource-schema.gql');

@Component({
  selector: 'kpi-define-schema',
  templateUrl: './define-schema.component.pug',
  styleUrls: ['./define-schema.component.scss']
})
export class SchemaFormComponent implements OnInit {
  @ViewChild(NewCustomListComponent) newCustomListComponent: NewCustomListComponent;
  @ViewChild(InvalidRowsPopupComponent) invalidRowsPopupComponent: InvalidRowsPopupComponent;
  @Input() schema;
  @Input() importFile = false;

  schemas: FormArray;
  defaultDateRangeField: number;
  isCollapsedSchema = false;
  isCollapsedAssignUser = true;
  isEditing: boolean;
  invalidData = undefined;
  invalidDataReady = false;

  usersList: [{
    _id: string;
    fullName: string;
    pictureUrl: string
    selected: boolean;
  }];

  currentUser: IUserInfo;
  customList: SelectionItem[] = [];
  selectedNewList: SelectionItem[] = [];
  customListOptions: SelectionItem[] = [
    { id: 'selectionList', title: 'Selection List', disabled: true },
    { id: 'createList', title: ' + Create List', disabled: false }
  ];

  subscription: Subscription[] = [];

  listOfCustomListQuery: QueryRef<any>;

  lastInsertedCustomList: ICustomList;

  indexModified = 0;
  dataTypeUpdated = false;

  constructor(
    public vmData: DataEntryFormViewModel,
    private vmListForm: CustomListFormViewModel,
    private _apollo: Apollo,
    private _userService: UserService,
    private _router: Router
  ) {}

  ngOnInit() {
    this.isEditing = !!(this.schema);
    const model = (this.schema) ? this.schema : this.vmData.getDefaultInputSchema();
    this.vmData.initialize(model);
    this.vmListForm.initialize(this.vmListForm.defaultCustomListModel);
    this.schemas = this.vmData.fg.get('schema') as FormArray;
    this.defaultDateRangeField = this.vmData.fg.controls.schema.value.findIndex(f => f.dataType === 'Date');
    this._getCurrentUser();
    this._getAllUsers();
    this._getCustomList();
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
          let selectedUsers = [];
          let userSelected = false;

          if (this.isEditing) {
            selectedUsers = this.schema.users;
            userSelected = (selectedUsers) ? selectedUsers.includes(u._id) : false;
          } else {
            userSelected = !!(this.currentUser._id === u._id);
          }

          return {
            _id: u._id,
            fullName: u.profile.firstName + ' ' + u.profile.lastName,
            pictureUrl: u.profilePictureUrl,
            selected: userSelected
          };
        });
      });
  }

  private _getCustomList() {
    this.listOfCustomListQuery = this._apollo.watchQuery<any>({
      query: getCustomListQuery,
      fetchPolicy: 'network-only'
    });

    this.subscription.push(this.listOfCustomListQuery.valueChanges.subscribe(res => {
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
    this.schemas.controls.forEach(fg => {
      fg.get('dataType').valueChanges.subscribe(c => {
        this.dataTypeUpdated = true;
    });
    });
    this.schemas.valueChanges.subscribe(fg => {
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
    return true;
    // const selectedUsers = this.usersList ? this.usersList.filter(u => u.selected === true) : [];
    // const dateFields = this.vmData.fg.get('schema').value.filter(f => f.dataType === 'Date');
    // return this.vmData.fg.controls['dataName'].value !== '' && selectedUsers.length && dateFields.length;
  }

  updateUserSelection(selected, index) {
    this.usersList[index].selected = selected;
  }

  save() {
    if (this.dataTypeUpdated === true) {
      Sweetalert({
        type: 'warning',
        title: 'Are you sure?',
        text: `Changing the data type of fields may result in losing some data
               not complying with your new definicion.
               Are you sure you want to continue?`,
        showConfirmButton: true,
        showCancelButton: true,
        confirmButtonText: '[Yes, continue]',
        cancelButtonText: '[No, Cancel]',
      }).then(result => {
        if (result.dismiss === Sweetalert.DismissReason.cancel) {
          return;
        }
        if (result.value === true) {
          this.continueSavingData();
          return;
        }
      });
    }
    this.continueSavingData();
  }

  continueSavingData() {
    const tableFields = [];
    let tableRecords = [];
    const schemaFormGroup = <any>this.vmData.fg.get('schema') as FormArray;
    schemaFormGroup.controls.map(s => {
      const schema = <any>s;
      tableFields.push(schema.value);
    });
    if (this.importFile) {
      tableRecords = this.schema.data;
    } else {
      const dataFormGroup = this.vmData.fg.get('data') as FormArray;
      dataFormGroup.controls.map(d => {
        const controlGroup = <any>d;
        const data = [];
        controlGroup.controls.map(c => {
          data.push(c.value);
        });

        tableRecords.push(data);
      });
    }

    const selectedUsers = this.usersList.filter(f => f.selected).map(u => {
      return u._id;
    });

    /* value could be either a number indicating the index of the date in
    the tableFields array or a string with the path of the field itself*/
    const dateFieldControl = this.vmData.fg.controls['dateRangeField'].value;

    const dateFieldIndex = (!isNaN(dateFieldControl)) ?
                            +dateFieldControl :
                            tableFields.findIndex(f => f.path.toLowerCase() === dateFieldControl.toLowerCase());

    const tableData: ICustomData = {
      inputName: this.vmData.fg.controls['dataName'].value,
      fields: JSON.stringify(tableFields),
      records: JSON.stringify(tableRecords),
      dateRangeField: tableFields[dateFieldIndex].columnName,
      users: selectedUsers
    };

    if (this.isEditing && !this.importFile) {

      this._apollo.mutate<any> ({
        mutation: updateSchemaMutation,
        variables: {id: this.schema.id, input: tableData },
        refetchQueries: ['DataEntries']})
      .toPromise()
      .then(result => {

        const resultData = result.data.updateVirtualSourceSchema || null;
        if (resultData.success) {
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
                this._router.navigate(['data-entry', 'enter-data', resultData.entity.id]);
              });
            });
          } else {
            this._router.navigate(['data-entry', 'enter-data', resultData.entity.id]);
          }
        }
      })
      .catch(err => console.log('Server errors: ' + JSON.stringify(err)));

    } else {
    // add new data entry
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
              const customList = this.vmData.customListSource;
              const sourceOrigin = customList.filter(list => {
                const customListField = tableFields.find(f => f.dataType === list._id);
                if (customListField) {
                  return list;
                }
              });
              const invalidRows = JSON.parse(resultData.invalidRows);
              if (invalidRows.length > 0) {
              // Here i Must Open a new window popup
                // showing the invalid rows
                this.invalidData = cloneDeep(this.schema);
                this.invalidData.schema = {};
                this.schema.schema.map(s => {
                  const collection = {};
                  this.invalidData.schema[s.columnName] = {
                    dataType: s.dataType,
                    path: s.path,
                    required: s.required
                  };
                });
                debugger;
                this.invalidData.data = invalidRows;
                this.invalidDataReady = true;
                this.invalidRowsPopupComponent.open();
              }
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
    this.selectedNewList = list.listValue.map(v => {
      return {
        id: v,
        title: v,
        selected: false,
        disabled: false
      };
    });
    this.lastInsertedCustomList = list;
    this.listOfCustomListQuery.refetch().then(() => this._getCustomList());
  }

  closeInvalidRowsModal() {
    this.invalidDataReady = false;
    this.invalidRowsPopupComponent.close();
  }

}
