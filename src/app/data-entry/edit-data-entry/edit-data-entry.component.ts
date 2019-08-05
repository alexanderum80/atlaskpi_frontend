import { IUserInfo } from './../../shared/models/user';
import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { ApolloService } from 'src/app/shared/services/apollo.service';
import { Activity } from 'src/app/shared/authorization/decorators/component-activity.decorator';
import { UpdateShemaAtlasSheetsActivity } from 'src/app/shared/authorization/activities/atlas-sheets/update-schema-atlas-sheets.activity';
import { UserService } from './../../shared/services/user.service';

const virtualSourceById = require('graphql-tag/loader!../shared/graphql/data-entry-by-id.gql');
const virtualSourceByIdREAL = require('graphql-tag/loader!../shared/graphql/virtual-source-by-id.gql');

@Activity(UpdateShemaAtlasSheetsActivity)
@Component({
  selector: 'kpi-edit-data-entry',
  templateUrl: './edit-data-entry.component.pug',
  styleUrls: ['./edit-data-entry.component.scss']
})

export class EditDataEntryComponent implements OnInit {
  @Input() inputSchema;
  @Input() importFile = false;

  virtualSource;
  loading = true;
  currentUser: IUserInfo;
  private _subscriptions: Subscription[] = [];
  constructor(
    private _activatedRoute: ActivatedRoute,
    private _userService: UserService,
    private _apolloService: ApolloService) { }

  ngOnInit() {
    this._userService.user$
      .distinctUntilChanged()
      .subscribe((user: IUserInfo) => {
          this.currentUser = user;
      });
    this._subscriptions.push(
      this._activatedRoute.params.subscribe(
        params => this.getVirtualSource(params['id'])
      )
    );
  }

  private getVirtualSource( VsId: string) {
    if (this.inputSchema) {
      // Aqui tengo que llenar la variable virtualS
      const transformedVS = {
        id: VsId,
        dataName: this.inputSchema.dataName,
        dateRangeField: this.inputSchema.dateRangeField,
        schema: this.inputSchema.schema,
        data: this.inputSchema.data,
        users: this.currentUser._id
      };
      this.virtualSource = transformedVS;
      this.loading = false;
    } else {
      this._apolloService.networkQuery<string>(virtualSourceByIdREAL, {id: VsId})
      .then(res => {
        const virtualS = JSON.parse(res.virtualSourceById);
        const fieldsMap = virtualS.fieldsMap;
        const schemaKeys = Object.keys(fieldsMap);

        // Date: {required: true, dataType: "Date", path: "date"}
        let tempSchemaArr = schemaKeys.map(fieldName => {
          if (fieldName.toLowerCase() === 'source' || fieldName.toLowerCase() === 'timestamp') {
            return null;
          }
          const fieldTemp = {
            columnName: fieldName,
            dataType: fieldsMap[fieldName].dataType,
            required: fieldsMap[fieldName].required,
            path: fieldsMap[fieldName].path,
            allowGrouping: fieldsMap[fieldName].allowGrouping,
            defaultValue: fieldsMap[fieldName].defaultValue
          };
          return fieldTemp;
        });

        tempSchemaArr = tempSchemaArr.filter(elem => elem != null);

        const transformedVS = {
          id: VsId,
          dataName: virtualS.description,
          dateRangeField: virtualS.dateField,
          schema: tempSchemaArr,
          users: virtualS.users
        };
        this.virtualSource = transformedVS;
        this.loading = false;
      });
    }
  }
}

export interface IVirtualSource {
  customLists: string[];
  dataName: string;
  dateRangeField: string;
  name:  string; // "Integry Summary Manual"
  schema: any;
}

export interface IField {
  required: boolean; // true
  dataType: string; // "Number"
  path: string; // "amount"
}
