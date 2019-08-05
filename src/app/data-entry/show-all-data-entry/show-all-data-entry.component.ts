import { UserService } from './../../shared/services/user.service';
import { IListItem } from 'src/app/shared/ui/lists/list-item';
import { ErrorComponent } from 'src/app/shared/ui/error/error.component';
import { IModalError } from './../../shared/interfaces/modal-error.interface';
import { IUserInfo } from './../../shared/models/user';
import { DataEntryFormViewModel, DataEntrySchemaViewModel } from '../data-entry.viewmodel';
import { QueryRef, Apollo } from 'apollo-angular';
import SweetAlert from 'sweetalert2';
import { DataEntryList, IDataEntrySource } from '../shared/models/data-entry.models';
import { Component, OnInit, OnDestroy, ViewChild, Output, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonService } from 'src/app/shared/services';
import { ApolloService } from 'src/app/shared/services/apollo.service';
import { concat, sortBy } from 'lodash';
import { MenuItem, ModalComponent } from 'src/app/ng-material-components';
import { Router, ActivatedRoute, Route } from '@angular/router';
import { notVisibleMenuItem, visibleMenuItem } from 'src/app/shared/helpers/visible-action-item.helper';
import { isNumber } from 'lodash';
import { cloneDeep } from 'apollo-utilities';
import { UpdateDataComponent } from '../update-data/update-data.component';
import { UpdateShemaAtlasSheetsActivity } from 'src/app/shared/authorization/activities/atlas-sheets/update-schema-atlas-sheets.activity';
import { DeleteAtlasSheetsActivity } from 'src/app/shared/authorization/activities/atlas-sheets/delete-atlas-sheets.activity';
import { AddAtlasSheetsActivity } from 'src/app/shared/authorization/activities/atlas-sheets/add-atlas-sheets.activity';
import { UpdateDataAtlasSheetsActivity } from 'src/app/shared/authorization/activities/atlas-sheets/update-data-atlas-sheets.activity';

const allUsersQuery = require('graphql-tag/loader!../../users/shared/graphql/get-all-users.gql');
const dataEntriesQuery = require('graphql-tag/loader!../shared/graphql/data-entries.gql');
const dataEntryIdQuery = require('graphql-tag/loader!../shared/graphql/data-entry-by-id.gql');
const removeDataEntryMutation = require('graphql-tag/loader!../shared/graphql/remove-data-entry.gql');
const updateUserPreference = require('graphql-tag/loader!../shared/graphql/update-user-preference.mutation.gql');
const currentUserInfo = require('graphql-tag/loader!../../users/shared/graphql/current-user.gql');

const EntryType = {
  Table: 'table',
  Excel: 'excel',
  CSV: 'csv'
};

const ImageUrl = {
  Table: '../../../assets/img/datasources/table.png',
  Excel: '../../../assets/img/datasources/excel.png',
  CSV: '../../../assets/img/datasources/csv.png',
};

@Component({
  selector: 'kpi-show-all-data-entry',
  templateUrl: './show-all-data-entry.component.pug',
  styleUrls: ['./show-all-data-entry.component.scss']
})
export class ShowAllDataEntryComponent implements OnInit, OnDestroy {
  @ViewChild(ErrorComponent) errorModal: ErrorComponent;
  @ViewChild(UpdateDataComponent)
  private updateModalComponent: UpdateDataComponent;

  dataEntryCollection: IDataEntrySource[];
  dataEntries: DataEntryList[];
  dataEntriesQueryRef: QueryRef<any>;
  private _subscription: Subscription[] = [];

  allUsers: IUserInfo[];

  loading = true;

  uploadingFile = false;

  lastError: IModalError;

  actionItemsFile: MenuItem[] = [{
    id: '1',
    icon: 'more-vert',
    children: [
        {
            id: 'edit',
            icon: 'edit',
            title: 'Edit Schema'
        },
        {
            id: 'upload-data',
            icon: 'refresh-alt',
            title: 'Upload data',
        },
        {
            id: 'download',
            icon: 'download',
            title: 'Download'
        },
        {
            id: 'delete',
            icon: 'delete',
            title: 'Delete'
        },
        {
            id: 'visible',
            title: 'Visible',
            icon: 'eye'
        }
    ]
  }];

  dataEntryToUpload: IDataEntrySource;
  user: IUserInfo;

  constructor(
    private _apolloService: ApolloService,
    private _apollo: Apollo,
    private vm: DataEntryFormViewModel,
    private _router: Router,
    private _activatedRoute: ActivatedRoute,
    private _userService: UserService,
    public updateSchemaActivity: UpdateShemaAtlasSheetsActivity,
    public deleteAtlasSheetActivity: DeleteAtlasSheetsActivity,
    public addAtlasSheetActivity: AddAtlasSheetsActivity,
    public updateDataActivity: UpdateDataAtlasSheetsActivity,
  ) {
    this._subscription.push(
      this._userService.user$
          .distinctUntilChanged()
          .subscribe((user: IUserInfo) => {
              this.user = user;
          }));
  }

  async ngOnInit() {
    this.vm.addActivities([
      this.updateDataActivity,
      this.updateSchemaActivity,
      this.addAtlasSheetActivity,
      this.deleteAtlasSheetActivity
    ]);

    this._disabledActionItem();

    if (!this.vm.dataEntryPermission()) {
      this._router.navigateByUrl('/unauthorized');
    } else {
      await this._getAllUsers();
      this._getDataEntries();
    }
  }

  ngOnDestroy() {
    CommonService.unsubscribe(this._subscription);
  }

  private async _getAllUsers() {
    this.allUsers = await this._apolloService.networkQuery<IUserInfo[]>(allUsersQuery).then(users => {
       return users.allUsers;
    });
  }

  private _getDataEntries() {
    this.dataEntriesQueryRef = this._apollo.watchQuery<any> ({
      query: dataEntriesQuery,
      fetchPolicy: 'network-only'
    });

    this._subscription.push(
        this.dataEntriesQueryRef.valueChanges.subscribe(res => {
          this._processDataEntries(res.data.dataEntries);
          this.loading = false;
        })
    );
  }

  private _processDataEntries(dataEntries) {
    this.dataEntries = undefined;
    if (dataEntries.length) {
      this.dataEntryCollection = dataEntries;
      this.dataEntries = sortBy(dataEntries.map(data => {
        let description: string = data.description;
        const fileExtensionIndex = description.lastIndexOf('.') !== -1 ?
                                  description.lastIndexOf('.') :
                                  description.length;
        description = description.substr(0, fileExtensionIndex);

        const imageUrl = this._getImageUrl(data.description);

        const SheetsIdNoVisible = this.user.preferences && this.user.preferences.atlasSheetsIdNoVisible
                                ? this.user.preferences.atlasSheetsIdNoVisible.split('|') : undefined;

        let visibilityActionItem;
        if (!SheetsIdNoVisible || SheetsIdNoVisible.findIndex(f => f === data._id) < 0) {
          visibilityActionItem = notVisibleMenuItem();
        } else {
          visibilityActionItem = visibleMenuItem();
        }

        const actionItems = this.actionItemsFile;

        const newActionItems = cloneDeep(actionItems);

        const index = newActionItems[0].children.findIndex(child => child.id === 'visible' || child.id === 'notvisible');
        if (isNumber(index)) {
          newActionItems[0].children[index] = visibilityActionItem;
        }

        return {
          _id: data._id,
          name: data.name,
          description: description,
          virtualSource: data.dataSource,
          image: imageUrl,
          users: data.users,
          actionItems: newActionItems,
          createdBy: this._getCreatedByName(data.createdBy)
        };
      }), ['_id']);
    }
  }

  private _getImageUrl(description) {
    const extension = this._getFileExtension(description);
    switch (extension) {
      case '.xls':
        return ImageUrl.Excel;
      case '.xlsx':
        return ImageUrl.Excel;
      case '.csv':
        return ImageUrl.CSV;
      default:
        return ImageUrl.Table;
    }
  }

  private _getDataEntriesType(description: string) {
    const extension = this._getFileExtension(description);
    switch (extension) {
      case '.xls':
        return EntryType.Excel;
      case '.xlsx':
        return EntryType.Excel;
      case '.csv':
        return EntryType.CSV;
      default:
        return EntryType.Table;
    }
  }

  private _getFileExtension(description) {
    const lastIndex = description.lastIndexOf('.');
    if (lastIndex === -1) {
      return EntryType.Table;
    }
    const extension = description.substr(lastIndex, description.length - 1);
    return extension;
  }

  private _getCreatedByName(userId) {
    const user = this.allUsers.find(u => u._id === userId);
    const userName = user.profile.firstName + ' ' + user.profile.lastName;
    return userName;
  }

  actionClicked(item: IListItem, dataEntry: DataEntryList) {
    switch (item.id) {
      case 'upload-data':
        this._uploaddata(dataEntry);
        break;
      case 'download':
        this._downloadFile(dataEntry._id);
        break;
      case 'edit':
        this._editSchema(dataEntry._id);
        break;
      case 'delete':
        this._removeDataEntry(dataEntry.name);
        break;
      case 'visible':
      case 'notvisible':
        this.update(item, dataEntry);
        break;
    }
  }

  addDataEntry() {

    if (!this.addSheetPermission()) {
      this._router.navigateByUrl('/unauthorized');
    }
    this._router.navigateByUrl('/data-entry/new');
  }

  private _uploaddata(dataEntry) {
    if (!this._updateDataPermission()) {
      this._router.navigateByUrl('/unauthorized');
    }

    this.dataEntryToUpload = this.dataEntryCollection.find(f => f._id === dataEntry._id);
    this.updateModalComponent.openModal();
  }

  private _editSchema(dataEntryId) {
    if (!this._editSchemaPermission()) {
      this._router.navigateByUrl('/unauthorized');
    }
    this._router.navigate(['../edit', dataEntryId], {relativeTo: this._activatedRoute});
  }

  closeUploadFile() {
    this.uploadingFile = false;
  }

  private _downloadFile(dataEntryId: string) {
    this._apolloService.networkQuery<string>(dataEntryIdQuery, {id: dataEntryId}).then(res => {
      const dataSourceCollection = JSON.parse(res.dataEntryByIdMapCollection);
      const schemaCollection = dataSourceCollection.schema;
      const dataCollection = dataSourceCollection.data;
      const collectionName = dataSourceCollection.dataName;

      const dataArray = [];
      const fields = [];
      for (const field in schemaCollection) {
        if (field !== 'Source') {
          fields.push(field);
        }
      }
      // dataArray.push(fields);

      dataCollection.map(d => {
        const data = [];
        fields.map(f => {
          const fieldName = f.toLowerCase().replace(' ', '_');
          data.push(d[fieldName]);
        });
        dataArray.push(data);
      });

      this.vm.downloadToCsvFile(collectionName, fields, dataArray);
    });
  }

  private _removeDataEntry(name) {
    return SweetAlert({
      title: 'Are you sure you want to remove this file?',
      type: 'warning',
      width: '600px',
      showConfirmButton: true,
      showCancelButton: true
    })
    .then((res) => {
        if (res.value === true) {
          this._subscription.push(this._apolloService.mutation<any>(removeDataEntryMutation, {name: name}, ['DataEntries']).then(result => {
            if (result.data.removeDataEntry.success) {
              console.log('data entry removed.');
              this._userService.updateUserInfo(true);
            } else {
              const entity = JSON.parse(result.data.removeDataEntry.entity);
              if (entity && entity.length) {
                const kpis = entity.map(k => 'KPI: ' + k.name);

                this.lastError = {
                  title: 'Error removing data entry',
                  msg: 'A data entry cannot be removed while it\'s being used. ' +
                        'The following element(s) are currently using it: ',
                  items: kpis
                };
                this.errorModal.open();
              }
            }
          }));
        }
    });
  }

  private update(item: IListItem, dataEntry: DataEntryList) {
    const that = this;
    const IdDataEntry = dataEntry._id;
    if (!this.user || !this.user._id) {
        return;
    } else {
        this._subscription.push(
            this._apolloService.mutation<{
                updateUserPreference: {
                    success
                }
            }>(updateUserPreference, {
                id: this.user._id,
                input: { atlasSheetsIdNoVisible: IdDataEntry }
            }, ['DataEntries'])
                .then(result => {
                    const response = result;
                    if (response.data.updateUserPreference.success === true) {
                      this._refetchUserInfo();
                      this._refetchDataEntries();
                    }
                })
        );
    }
  }

  private async _refetchUserInfo() {
    this.user = await this._apolloService.networkQuery<IUserInfo>(currentUserInfo).then(d => {
        return d.User;
    });
  }

  private _refetchDataEntries() {
    this.dataEntriesQueryRef.refetch().then(res => this._processDataEntries(res.data.dataEntries));
  }

  // find the object in the array of actionItems
  // set disabled to boolean value
  private _disabledActionItem(): void {
    if (this.actionItemsFile && this.actionItemsFile.length) {
        const itemAction = this.actionItemsFile[0];

        if (itemAction.children) {
            itemAction.children.forEach(item => {
                if (item.id === 'edit') {
                    item.disabled = !this._editSchemaPermission();
                }
                if (item.id === 'upload-data') {
                    item.disabled = !this._updateDataPermission();
                }
                if (item.id === 'delete') {
                    item.disabled = !this._deleteSheetPermission();
                }
            });
        }
    }
}

private _editSchemaPermission() {
  return this.updateSchemaActivity.check(this.user);
}

private _updateDataPermission() {
  return this.updateDataActivity.check(this.user);
}

private _deleteSheetPermission() {
  return this.deleteAtlasSheetActivity.check(this.user);
}

addSheetPermission() {
  return this.addAtlasSheetActivity.check(this.user);
}


}
