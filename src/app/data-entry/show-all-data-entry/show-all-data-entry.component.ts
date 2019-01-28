import { ErrorComponent } from 'src/app/shared/ui/error/error.component';
import { IModalError } from './../../shared/interfaces/modal-error.interface';
import { IUserInfo } from './../../shared/models/user';
import { DataEntryFormViewModel, DataEntrySchemaViewModel } from '../data-entry.viewmodel';
import { QueryRef, Apollo } from 'apollo-angular';
import SweetAlert from 'sweetalert2';
import { DataEntryList, IDataEntrySource } from '../shared/models/data-entry.models';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonService } from 'src/app/shared/services';
import { ApolloService } from 'src/app/shared/services/apollo.service';
import { concat, sortBy } from 'lodash';
import { MenuItem } from 'src/app/ng-material-components';
import { Router } from '@angular/router';

const allUsersQuery = require('graphql-tag/loader!../../users/shared/graphql/get-all-users.gql');
const dataEntriesQuery = require('graphql-tag/loader!../shared/graphql/data-entries.gql');
const dataEntryIdQuery = require('graphql-tag/loader!../shared/graphql/data-entry-by-id.gql');
const removeDataEntryMutation = require('graphql-tag/loader!../shared/graphql/remove-data-entry.gql');

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
  dataEntryCollection: IDataEntrySource[];
  dataEntries: DataEntryList[];
  dataEntriesQueryRef: QueryRef<any>;
  private _subscription: Subscription[] = [];

  allUsers: IUserInfo[];

  loading = true;

  uploadingFile = false;

  lastError: IModalError;

  actionItemsTable: MenuItem[] = [{
    id: '1',
    icon: 'more-vert',
    children: [
        {
            id: 'download',
            icon: 'download',
            title: 'Download'
        },
        {
            id: 'delete',
            icon: 'delete',
            title: 'Delete'
         }
    ]
  }];

  actionItemsFile: MenuItem[] = [{
    id: '1',
    icon: 'more-vert',
    children: [
        // {
        //     id: 'upload-file',
        //     icon: 'upload',
        //     title: 'Upload file',
        // },
        {
            id: 'download',
            icon: 'download',
            title: 'Download'
        },
        {
            id: 'delete',
            icon: 'delete',
            title: 'Delete'
         }
    ]
  }];

  dataEntryToUpload: IDataEntrySource;

  constructor(
    private _apolloService: ApolloService,
    private _apollo: Apollo,
    private vm: DataEntryFormViewModel,
    private _router: Router
  ) { }

  async ngOnInit() {
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
          this.dataEntries = undefined;
          if (res.data.dataEntries.length) {
            this.dataEntryCollection = res.data.dataEntries;
            this.dataEntries = sortBy(res.data.dataEntries.map(data => {
              let description: string = data.description;
              const fileExtensionIndex = description.lastIndexOf('.') !== -1 ?
                                        description.lastIndexOf('.') :
                                        description.length;
              description = description.substr(0, fileExtensionIndex);

              const imageUrl = this._getImageUrl(data.description);
              const actionItems = this._getDataEntriesType(data.description) === EntryType.Table ?
                                  this.actionItemsTable : this.actionItemsFile;
              return {
                _id: data._id,
                name: data.name,
                description: description,
                virtualSource: data.dataSource,
                image: imageUrl,
                users: data.users,
                actionItems: actionItems,
                createdBy: this._getCreatedByName(data.createdBy)
              };
            }), ['_id']);

          }
          this.loading = false;
        })
    );
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

  actionClicked(item: MenuItem, dataEntry: DataEntryList) {
    switch (item.id) {
      case 'upload-file':
        this._uploadFile(dataEntry);
        break;
      case 'download':
        this._downloadFile(dataEntry._id);
        break;
      case 'delete':
        this._removeDataEntry(dataEntry.name);
        break;
    }
  }

  addDataEntry() {
    this._router.navigateByUrl('/data-entry/new');
  }

  private _uploadFile(dataEntry) {
    this.dataEntryToUpload = this.dataEntryCollection.find(f => f._id === dataEntry._id);
    this.uploadingFile = true;
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
}
