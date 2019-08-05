import SweetAlert from 'sweetalert2';
import { ApolloService } from './../../shared/services/apollo.service';
import { FormGroup, FormControl } from '@angular/forms';
import { DataEntryFormViewModel } from '../data-entry.viewmodel';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { savingStatus, EnterDataFormService} from './enter-data-form.service';
import { BrowserService } from '../../shared/services/browser.service';
import { canComponentDeactivate } from '../unsaved-changes-guard.service';

const dataEntryIdQuery = require('graphql-tag/loader!../shared/graphql/data-entry-by-id.gql');
const customListIdQuery = require('graphql-tag/loader!../shared/graphql/get-custom-list.gql');
const updateDataEntryMutation = require('graphql-tag/loader!../shared/graphql/update-data-entry.gql');
const removeRowsDataEntryMutation = require('graphql-tag/loader!../shared/graphql/remove-rows-data-entry.gql');

// const sidebarStyle = { width: 'calc(100vw - 240px)', height: 'calc(100vh - 210px)', padding: '10px' };
// const noSidebarStyle = { width: '100vw', height: 'calc(100vh - 210px)', padding: '10px' };

const heightDefault = 'calc(100vh - 240px)';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'kpi-enter-data-form',
    templateUrl: './enter-data-form.component.pug',
    styleUrls: ['./enter-data-form.component.scss'],
    providers: [DataEntryFormViewModel, EnterDataFormService]
})

export class EnterDataFormComponent implements OnInit, OnDestroy, canComponentDeactivate {

    height = heightDefault;
    savingStatus = savingStatus;

    defaultColDef = {
        filter: true,
        sortable: true,
        editable: true,
        resizable: true,
    };
    columnDefs = [];
    rowData: any[];
    isLoading = false;
    sidebarOpen: boolean;
    containerHeight;
    fullscreen = false;

    name: string;
    dataSourceCollection: any;

    selectedRows = false;

    private _subscription: Subscription[] = [];
    private gridApi;
    private gridColumnApi;
    private recordsCount: number;

    fg: FormGroup = new FormGroup({
        'searchValue': new FormControl()
    });

    constructor(
        public vm: DataEntryFormViewModel,
        public deService: EnterDataFormService,
        private _route: ActivatedRoute,
        private _router: Router,
        private _apolloService: ApolloService,
        private _browserService: BrowserService,
    ) {}

    ngOnInit() {
        this._subscription.push(this._route.params.subscribe(params => {
            if (params.id) { this.loadData(params.id); }
        }));

        this._subscription.push(this._browserService.viewportSize$.subscribe(size => {
            this.sidebarOpen = size.width >= 1200;
        }));

        this._subscription.push(this.deService.recordsCount$.subscribe( count =>
            this.recordsCount = count)
            );
        this._subscription.push( this.fg.get('searchValue').valueChanges
        .debounceTime(300)
        .distinctUntilChanged()
        .subscribe(
            val =>
                this.onSearchBoxChanges(val))
        );
        this.containerHeight = this.height + '+ 20px';
    }

    onSearchBoxChanges(value) {
        this.gridApi.setQuickFilter(value);
    }

    canDeactivate(): Promise<boolean> {
       return this.canLeaveRoute();
    }

    ngOnDestroy() {
        this._subscription.forEach(s => s.unsubscribe());
    }

    // get gridLayoutStyle() {
    //     return this.sidebarOpen ? this.sidebarStyle : this.noSidebarStyle;
    // }

    onGridReady(params) {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
    }

    onCellValueChanged(info) {
        this.deService.registerChange(info);
    }

    onSelectionChanged() {
        const selectedRowsData = this.gridApi.getSelectedRows();
        const selectedRowsNotEmpty = selectedRowsData.filter(row => row._id);

        this.selectedRows = (selectedRowsNotEmpty && selectedRowsNotEmpty.length) ? true : false;
    }

    removeRows() {

        return SweetAlert({
            titleText: 'Are you sure you want to delete these rows?',
            text: ` This action cannot be undone`,
            type: 'warning',
            showConfirmButton: true,
            showCancelButton: true
        })
            .then((res) => {
                if (res.value === true) {
                    const selectedDataRaw = this.gridApi.getSelectedRows();

                    // making sure there are no empty rows here
                    const docsToRemove = selectedDataRaw.filter(row => row._id);

                   this.deService.countChanged( docsToRemove.length);
                    if (docsToRemove && docsToRemove.length) {
                        this._apolloService.mutation<any>(
                            removeRowsDataEntryMutation,
                            {
                                VsId: this._route.snapshot.params.id,
                                rowsIds: docsToRemove.map(rowData => rowData._id)
                            },
                            ['DataEntries']
                            )
                            .then(result => {
                                if (result.data.removeRowsDataEntry.success) {

                                    this.gridApi.updateRowData({ remove: docsToRemove });
                                }
                            })
                            .catch(err => console.log('Server errors: ' + JSON.stringify(err)));
                    }
                }
            });


    }

    save() {
        // this.deService.registeredChanges.map(record => record.source = "Manual entry");

        // this._apolloService.mutation<any>(
        //     updateDataEntryMutation,
        //     {
        //         id: this._route.snapshot.params.id,
        //         input: JSON.stringify(this.deService.registeredChanges)
        //     },
        //     ['DataEntries']
        // )
        //     .then(result => {
        //         if (result.data.updateDataEntry.success) {
        //             SweetAlert({
        //                 type: 'info',
        //                 title: 'All changes have been saved successfully',
        //                 showConfirmButton: true,
        //                 confirmButtonText: 'OK'
        //             });
        //             this._router.navigateByUrl('data-entry/show-all');
        //         }
        //     })
        //     .catch(err => console.log('Server errors: ' + JSON.stringify(err)));
    }

    canLeaveRoute(): Promise<boolean> {

        if (this.deService.hasChanges) {
            return SweetAlert({
                titleText: 'Do you want to discard your changes?',
                text: `You have changes that have not been saved because you are missing
                required data. If you leave this route, you will lose these changes.
                Do you want to continue?`,
                type: 'warning',
                showConfirmButton: true,
                confirmButtonText: 'Yes, discard',
                showCancelButton: true
            })
            .then((res) => {
                return res.value;
            });
        }

        // - if you get this far is because there are no changes so the user can leave this route
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    }

    private loadData(id: string) {
        const that = this;
        this.isLoading = true;
        this._apolloService.networkQuery<string>(dataEntryIdQuery, { id }).then(res => {
            const dataSource = JSON.parse(res.dataEntryByIdMapCollection);
            this.name = dataSource.name;
            this.deService.registerDataSource(dataSource);
            that.isLoading = false;
        });
    }

    goToEmptyRow() {
        /* if some rows are removed this index will have
        the correct updated index of first empty row */
        const selectionIndex = this.recordsCount;

        /* this index is the value of the first column that becomes its id,
        though it will not change if rows are deleted */
        const nodeIndex = this.deService.initialRecords;

        if (nodeIndex >= 0  && selectionIndex >= 0) {
            this.gridApi.ensureIndexVisible(nodeIndex + 1, null);
            const node = this.gridApi.getRowNode(nodeIndex);

            if (node) {
                node.setSelected(true);
                this.gridApi.setFocusedCell( selectionIndex, this.deService.columnDefs[1].field);

                this.gridApi.startEditingCell(
                    {
                        rowIndex: selectionIndex,
                        colKey: this.deService.columnDefs[1].field
                    });
            }
        }
}

showFullscreen(event) {
    // clicking empty space
    if (event.target.innerHTML.match(/ngcontent/) !== null) { return; }

    this.fullscreen = this.fullscreen ? false : true;
    if (this.fullscreen) {
        this.height = 'calc(100vh - 100px)';
    } else {
        this.height = heightDefault;
    }
}

}
