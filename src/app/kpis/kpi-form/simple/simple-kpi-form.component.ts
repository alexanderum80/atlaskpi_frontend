import { map } from 'rxjs/operators';
// Angular Import
import { SelectPickerComponent } from '../../../ng-material-components/modules/forms/select-picker/select-picker.component';
import { ModalComponent } from '../../../ng-material-components/modules/user-interface/modal/modal.component';
import { IWidget } from '../../../widgets/shared/models';
import { WidgetsFormService } from '../../../widgets/widget-form/widgets-form.service';


import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    ElementRef,
    Input,
    OnDestroy,
    OnInit,
    Renderer,
    ViewChild,
} from '@angular/core';
import {Router} from '@angular/router';
import SweetAlert from 'sweetalert2';
// import { Observable } from 'rxjs/Observable';
// import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import { FormControl, FormGroup, AbstractControl } from '@angular/forms';
import Sweetalert from 'sweetalert2';
import { isEmpty } from 'lodash';

import { IDataSource, IDataSourceField } from '../../../shared/domain/kpis/data-source';
import { IKPI } from '../../../shared/domain/kpis/kpi';
import { ApolloService } from '../../../shared/services/apollo.service';
import { SimpleKpiFormViewModel } from './simple-kpi-form.viewmodel';
import { ITag } from '../../../shared/domain/shared/tag';
import { IKPIPayload } from '../shared/simple-kpi-payload';
import {CommonService} from '../../../shared/services/common.service';
import { Apollo, QueryRef  } from 'apollo-angular';
import { timeout } from 'rxjs/operators';
import { UserService } from '../../../shared/services';

const dataSources = require('graphql-tag/loader!../data-sources.gql');
const tags = require('graphql-tag/loader!./tags.gql');
const addKpiMutation = require('graphql-tag/loader!../add-kpi.mutation.gql');
const updateKpiMutation = require('graphql-tag/loader!../update-kpi.mutation.gql');

const getKPIByName = require('graphql-tag/loader!../kpi-by-name.gql');
const sourceQuery = require('graphql-tag/loader!./get-source-Query.gql');
const getKpiFilterExpressionQuery = require('graphql-tag/loader!../kpi-filter-expression.gql');

// App Code
@Component({
    selector: 'kpi-simple-kpi-form',
    templateUrl: './simple-kpi-form.component.pug',
    styleUrls: [ './simple-kpi-form.component.scss' ]
})
export class SimpleKpiFormComponent implements OnInit, AfterViewInit, OnDestroy {
    @Input() model: IKPI;
    @Input() editing: boolean;
    @Input() clone = false;
    @ViewChild('previewModal') previewModal: ModalComponent;

    @ViewChild('numericFieldSelector') set content(content: SelectPickerComponent) {
        if (content) {
            this.vm.numericFieldSelector = content;
        }
    }

    @ViewChild('vmSource') set sources(content: SelectPickerComponent) {
        if (content) {
            this.vm.vmSource = content;
        }
    }

    payload: IKPIPayload;
    mutation: string;
    resultName: string;
    isLoading = true;

    fromSaveAndVisualize: boolean;
    currrentKPI: IKPI;
    widgetModel: IWidget;
    newWidgetFromKPI: boolean;
    newChartFromKPI: boolean;

    vm: SimpleKpiFormViewModel;

    private _subscription: Subscription[] = [];

    constructor(
        // public vm: SimpleKpiFormViewModel,
        private _apolloService: ApolloService,
        private _apollo: Apollo,
        private _router: Router,
        private _cdr: ChangeDetectorRef,
        private _userService: UserService

    ) {}

    ngOnInit(): void {
        this._getDataSources();
    }

    ngAfterViewInit() {
        this._router.events.subscribe(e => {
            Sweetalert.close();
            // this._getDataSources();
        });
    }

    ngOnDestroy() {
        CommonService.unsubscribe(this._subscription);
    }

    private _openVisualizeModal() {
        this.fromSaveAndVisualize = true;
        this.save();
    }

    _closePreviewModal() {
        if ( this.newWidgetFromKPI === true || this. newChartFromKPI === true ) {
                        this.previewModal.close();
        } else {
            this.previewModal.close();
            this._goToListKpis();
        }
    }

    newWidget() {
        this.newWidgetFromKPI = true;
        this._closePreviewModal();
    }

    newChart() {
        this.newChartFromKPI = true;
        this._closePreviewModal();
    }

    save() {
        this.payload = this.vm.payload;
        this.mutation = this.payload.id ? updateKpiMutation : addKpiMutation;
        this.resultName = this.payload.id ? 'updateKPI' : 'createKPI';
        this.vm.updateExistDuplicatedName(false);

        if (!this.valid) {
            return SweetAlert({
                title: 'Make sure you entered all required information before you save this KPI.',
                type: 'error',
                showConfirmButton: true,
                confirmButtonText: 'Got it!'
            });
        }

        this._apolloService.networkQuery < IKPI > (getKPIByName, { name: this.payload.input.name }).then(d => {
            if ((d.kpiByName && this.resultName === 'createKPI') ||
                (d.kpiByName && this.resultName === 'updateKPI' && d.kpiByName._id !== this.payload.id)) {

                this.vm.updateExistDuplicatedName(true);

                this.vm.fg.controls['name'].setValue(this.vm.fg.controls['name'].value);

                return Sweetalert({
                    title: 'Duplicated name!',
                    text: 'You already have a KPI with that name. Please change the name and try again.',
                    type: 'error',
                    showConfirmButton: true,
                    confirmButtonText: 'Ok'
                });
            }

            this._apolloService.networkQuery<IKPI>(getKpiFilterExpressionQuery, { input: JSON.stringify(this.payload.input) })
                .then(result => {
                    let kpiList = result.kpiFilterExpression;
                    if (this.payload.id && !this.clone) {
                        kpiList = kpiList.filter(c => c._id !== this.payload.id);
                    }

                    let kpiListHtml = '';

                    kpiList.map(k => {
                        kpiListHtml += `<br><a href="#/kpis/edit/${k._id}">${k.name}</a>`;
                    });

                    if (kpiList.length) {
                        return SweetAlert({
                            title: 'Duplicated kpi!',
                            html: `<h3>The following kpis have the same configuration:</h3>
                                    ${kpiListHtml}`,
                            type: 'error',
                            showConfirmButton: true,
                            confirmButtonText: 'Ok'
                          });
                    }

                    this._apolloService.mutation<any>(this.mutation, this.payload)
                    .then(res => {
                        if (res.data[this.resultName].errors) {
                            return SweetAlert({
                                title: 'Some errors were found while saving this KPI. Please try again later',
                                type: 'error',
                                showConfirmButton: true,
                                confirmButtonText: 'Ok'
                              });
                        }
                        if (this.fromSaveAndVisualize) {
                            // for widget
                            this.currrentKPI = res.data[this.resultName].entity;
                            this.vm.valuesPreviewWidget.name = this.currrentKPI.name;
                            this.vm.valuesPreviewWidget.kpi = this.currrentKPI._id;
                            this.vm.valuesPreviewWidget.color = this.vm.selectColorWidget();
                            this.vm.valuesPreviewWidget.fontColor = this.vm.valuesPreviewWidget.color === ('white' || '#fff')
                            ? '#434348' : '#fff';
                            // for chart
                            this.vm.valuesPreviewChart.name = this.currrentKPI.name;
                            this.vm.valuesPreviewChart.kpi = this.currrentKPI._id;

                            this.fromSaveAndVisualize = !this.fromSaveAndVisualize;
                            this.previewModal.open();
                        } else {
                            this._router.navigateByUrl('/kpis/list');
                        }
                    });
                });

        });
    }


    cancel() {
        const that = this;

        if (!this.vm.fg.dirty) {
            return this._goToListKpis();
        }

        SweetAlert({
            title: 'Are you sure?',
            text: 'If you continue all your changes will be lost',
            type: 'warning',
            showConfirmButton: true,
            showCancelButton: true
        })
        .then((res) => {
            if (res.dismiss !== 'cancel' as any) {
                that._goToListKpis();
            }
        });
    }

    get vmFg(): boolean {
        return (this.vm && this.vm.fg) ? true : false;
    }

    get isNameInvalid() {
        return this.vm.fg.controls['name'].value &&
                this.vm.fg.controls['name'].invalid;
    }

    get expressionFieldValue(): string {
        return this.vm.fg.get('expression').get('field').value;
    }

    get valid(): boolean {
        return this.vm.fg.valid && !isEmpty(this.expressionFieldValue);
    }

    get hasFgControls(): boolean {
        if (!this.vm || !this.vm.fg || isEmpty(this.vm.fg.controls)) {
            return false;
        }
        return true;
    }

    get disableSave(): boolean {
        if (!this.hasFgControls) {
            return false;
        }
        return !this.vm.fg.valid;
    }

    get hasExpressionOperatorValue(): boolean {
        if (!this.hasFgControls) {
            return false;
        }

        const expression: AbstractControl = this.vm.fg.get('expression');
        if (!expression) {
            return false;
        }

        const expressionOperator: AbstractControl = expression.get('operator');
        return expressionOperator && !isEmpty(expressionOperator.value);
    }

    private _subscribeToNameChanges() {
        if (this.vm && this.vm.hasFormControls(this.vm.fg)) {
            this.vm.fg.controls['name'].valueChanges.subscribe(n => {
                const nameInput = n.trim();

                if (nameInput.length < 5) {
                    this.vm.fg.controls['name'].setErrors({required: true});
                } else {
                    if (this.vm.getExistDuplicatedName() === true) {
                        this._apolloService.networkQuery < IKPI > (getKPIByName, { name: nameInput }).then(d => {
                            if (!((d.kpiByName && this.resultName === 'createKPI') ||
                                (d.kpiByName && this.resultName === 'updateKPI' && d.kpiByName._id !== this.payload.id))) {

                                this.vm.fg.controls['name'].setErrors(null);
                            } else {
                                this.vm.fg.controls['name'].setErrors({forbiddenName: true});
                            }
                        });
                    } else {
                        this.vm.fg.controls['name'].setErrors(null);
                    }
                }
            });
        }
    }

    private _goToListKpis() {
        this._router.navigateByUrl('/kpis/list');
    }

    private _getDataSources() {
        const that = this;

        this._apolloService.networkQuery<{ dataSources: IDataSource[] }>(dataSources)
            .then(res => {
                /**
                 * have to instantiate view-model here
                 * simple-kpi is preserving the formgroup values when switch from
                 * edit-kpi to add-kpi and vice-versa for name and description
                 */
                that.isLoading = false;
                that.vm = new SimpleKpiFormViewModel(that._apollo, this._cdr, this._userService);

                that._getTags();

                that.vm.updateExistDuplicatedName(false);

                that.vm.updateDataSources(res.dataSources);

                this._subscribeToNameChanges();
                that.vm.initialize(that.model);

                this._subscribeToDataSourceChanges();
                this._cdr.detectChanges();
            });
    }

    private _getTags() {
        const that = this;
        this._apolloService.networkQuery<{ tags: ITag[] }>(tags)
            .then(res => {
                that.vm.updateTags(res.tags);
            });
    }

    private _subscribeToDataSourceChanges() {
        this.vm.fg.controls['expression'].get('dataSource').valueChanges.subscribe(value => {
            console.log('data source changed: ' + value);
        });
    }
}
