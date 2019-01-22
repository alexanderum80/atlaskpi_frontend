import { filter } from 'rxjs/operators';
import { AKPIDateFormatEnum } from './../../shared/models/date-range';
import SweetAlert from 'sweetalert2';
import { ICustomList } from '../custom-list/custom-list.viewmodel';
import { SelectionItem } from 'src/app/ng-material-components';
import { ICustomData } from './../shared/models/data-entry-form.model';
import { MenuItem } from './../../ng-material-components/models/menu-item';
import { ApolloService } from './../../shared/services/apollo.service';
import { FormArray, FormGroup, FormControl, Validators } from '@angular/forms';
import { DataEntryFormViewModel } from '../data-entry.viewmodel';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { IDatePickerConfig } from '../../ng-material-components/modules/forms/date-picker/date-picker/date-picker-config.model';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { forEach, orderBy, toNumber } from 'lodash';
import * as moment from 'moment';
import { EnterDataFormService } from './enter-data-form.service';
import { BrowserService } from '../../shared/services/browser.service';

const dataEntryIdQuery = require('graphql-tag/loader!../shared/graphql/data-entry-by-id.gql');
const customListIdQuery = require('graphql-tag/loader!../shared/graphql/get-custom-list.gql');
const updateDataEntryMutation = require('graphql-tag/loader!../shared/graphql/update-data-entry.gql');

const sidebarStyle = { width: 'calc(100vw - 240px)', height: 'calc(100vh - 140px)', padding: '10px' };
const noSidebarStyle = { width: '100vw', height: '100vh', padding: '10px' };

@Component({
    selector: 'kpi-enter-data-form',
    templateUrl: './enter-data-form.component.pug',
    styleUrls: ['./enter-data-form.component.scss'],
    providers: [DataEntryFormViewModel, EnterDataFormService]
})

export class EnterDataFormComponent implements OnInit, OnDestroy {

    defaultColDef = {
        filter: true,
        sortable: true,
        editable: true,
    };
    columnDefs = [];
    rowData: any[];
    isLoading = false;
    sidebarOpen: boolean;

    name: string;
    dataName: string;
    dataSourceCollection: any;
    customListCollection: any;
    schemaCollection: any;

    private _subscription: Subscription[] = [];

    constructor(
        public vm: DataEntryFormViewModel,
        public deService: EnterDataFormService,
        private _route: ActivatedRoute,
        private _router: Router,
        private _apolloService: ApolloService,
        private _browserService: BrowserService,
    ) { }

    ngOnInit() {
        if (!this.vm.dataEntryPermission()) {
            return this._router.navigateByUrl('/unauthorized');
        }

        this._subscription.push(this._route.params.subscribe(params => {
            if (params.id) { this.loadData(params.id); }
        }));

        this._subscription.push(this._browserService.viewportSize$.subscribe(size => {
            this.sidebarOpen = size.width >= 1200;
        }));
    }

    ngOnDestroy() {
        this._subscription.forEach(s => s.unsubscribe());
    }

    get gridLayoutStyle() {
        return this.sidebarOpen ? sidebarStyle : noSidebarStyle;
    }

    onCellValueChanged(info) {
        this.deService.registerChange(info.data);
    }

    save() {
        this._apolloService.mutation<any>(
            updateDataEntryMutation,
            {
                id: this._route.snapshot.params.id,
                input: JSON.stringify(this.deService.registeredChanges)
            },
            ['DataEntries']
        )
            .then(result => {
                if (result.data.updateDataEntry.success) {
                    SweetAlert({
                        type: 'info',
                        title: 'All changes have been saved successfully',
                        showConfirmButton: true,
                        confirmButtonText: 'OK'
                    });
                    this._router.navigateByUrl('data-entry/show-all');
                }
            })
            .catch(err => console.log('Server errors: ' + JSON.stringify(err)));
    }

    cancel() {

        if (this.deService.hasChanges) {
            return SweetAlert({
                titleText: 'Are you sure you want to discard your changes?',
                text: `You will lose all changes you made so far. This action can not be undone`,
                type: 'warning',
                width: '300px',
                showConfirmButton: true,
                showCancelButton: true
            })
            .then((res) => {
                if (res.value === true) {
                    this._router.navigateByUrl('/data-entry/show-all');
                }
            });
        } else {
            this._router.navigateByUrl('/data-entry/show-all');
        }
    }

    private loadData(id: string) {
        const that = this;
        this.isLoading = true;

        this._apolloService.networkQuery<string>(dataEntryIdQuery, { id }).then(res => {
            that.dataSourceCollection = JSON.parse(res.dataEntryByIdMapCollection);
            that.schemaCollection = that.dataSourceCollection.schema;
            that.rowData = that.deService.prepareRecords(that.dataSourceCollection);
            that.dataName = that.dataSourceCollection.dataName;
            that.name = that.dataSourceCollection.name;

            // prepare column definitions
            that.columnDefs = [];

            forEach(that.schemaCollection, (value, key) => {
                if (key !== 'Source') {
                    const columnDef: any = {
                        headerName: key,
                        field: value.path,
                        filter: that._getColumnFilter(value.dataType),
                    };

                    // check for numeric columns
                    if (value.dataType === 'Numeric') {
                        columnDef.type = 'numericColumn';
                    }

                    if (value.sourceOrigin) {
                        const customList = that.dataSourceCollection.customLists.find(l => l._id === value.sourceOrigin);
                        columnDef.cellEditor = 'agSelectCellEditor';
                        columnDef.cellEditorParams = {
                            values: customList.listValue
                        };
                    }

                    that.columnDefs.push(columnDef);
                }
            });
            that.isLoading = false;
        });
    }

    private _getColumnFilter(dataType: string) {
        switch (dataType) {
            case 'String':
                return 'agTextColumnFilter';
            case 'Numeric':
                return 'agNumberColumnFilter';
            case 'Date':
                return 'agDateColumnFilter';
            default:
                break;
        }
    }

}
