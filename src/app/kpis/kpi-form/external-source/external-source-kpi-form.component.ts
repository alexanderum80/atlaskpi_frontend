import { SelectPickerComponent } from '../../../ng-material-components/modules/forms/select-picker/select-picker.component';
import { ModalComponent } from '../../../ng-material-components/modules/user-interface/modal/modal.component';
import { IWidget } from '../../../widgets/shared/models';

import { Component, Input, ViewChild, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import SweetAlert from 'sweetalert2';

import { IExternalDataSource } from '../../../shared/domain/kpis/data-source';
import { IKPI } from '../../../shared/domain/kpis/kpi';
import { ApolloService } from '../../../shared/services/apollo.service';
import { ExternalSourceKpiFormViewModel } from './external-source-kpi-form.viewmodel';
import { AfterViewInit } from '@angular/core/src/metadata/lifecycle_hooks';
import { IKPIPayload } from '../shared/simple-kpi-payload';

const externalDataSourcesQuery = require('graphql-tag/loader!./external-data-sources.query.gql');
const addExternalSourceKpiMutation = require('graphql-tag/loader!./add-external-source-kpi.mutation.gql');
const updateExternalSourceKpiMutation = require('graphql-tag/loader!./update-external-source-kpi.mutation.gql');
const getKPIByName = require('graphql-tag/loader!../kpi-by-name.gql');
const getKpiFilterExpressionQuery = require('graphql-tag/loader!../kpi-filter-expression.gql');

@Component({
    selector: 'kpi-external-source-kpi-form',
    templateUrl: './external-source-kpi-form.component.pug',
    styleUrls: ['./external-source-kpi-form.component.scss'],
    providers: [ExternalSourceKpiFormViewModel]
})
export class ExternalSourceKpiFormComponent implements OnInit, AfterViewInit {
    @Input() model: IKPI;
    @Input() clone = false;
    @ViewChild('previewModal') previewModal: ModalComponent;

    @ViewChild('numericFieldSelector') set content(content: SelectPickerComponent) {
        if (content) {
            this.vm.numericFieldSelector = content;
        }
    }

    payload: IKPIPayload;
    mutation: string;
    resultName: string;

    fromSaveAndVisualize: boolean;
    currrentKPI: IKPI;
    widgetModel: IWidget;
    newWidgetFromKPI: boolean;
    newChartFromKPI: boolean;

    constructor(
        public vm: ExternalSourceKpiFormViewModel,
        private _apolloService: ApolloService,
        private _router: Router
    ) { }

    ngOnInit(): void {
        SweetAlert.close();
        this.vm.initialize(this.model);
        this._getExternalDataSources();
    }

    ngAfterViewInit() {
        this._subscribeToNameChanges();
    }

    private _openVisualizeModal() {
        this.fromSaveAndVisualize = true;
        this.save();
    }

    _closePreviewModal() {
        if (this.newWidgetFromKPI === true || this.newChartFromKPI === true) {
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
        this.mutation = this.payload.id ? updateExternalSourceKpiMutation : addExternalSourceKpiMutation;
        this.resultName = this.payload.id ? 'updateKPI' : 'createKPI';

        this.vm.updateExistDuplicatedName(false);

        if (!this.vm.fg.valid) {
            return SweetAlert({
                title: 'Make sure you entered all required information before you save this KPI.',
                type: 'error',
                showConfirmButton: true,
                confirmButtonText: 'Got it!'
            });
        }

        this._apolloService.networkQuery<IKPI>(getKPIByName, { name: this.payload.input.name }).then(d => {
            if ((d.kpiByName && this.resultName === 'createKPI') ||
                (d.kpiByName && this.resultName === 'updateKPI' && d.kpiByName._id !== this.payload.id)) {

                this.vm.updateExistDuplicatedName(true);

                this.vm.fg.controls['name'].setValue(this.vm.fg.controls['name'].value);

                return SweetAlert({
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
                        this.vm.valuesPreviewWidget.fontColor = this.vm.valuesPreviewWidget.color === '#fff'
                        ? '#434348' : '#fff';

                        // for chart
                        this.vm.valuesPreviewChart.name = this.currrentKPI.name;
                        // TODO: Need to review this later
                        this.vm.valuesPreviewChart.kpis = [{ type: 'column', kpi: { _id: this.currrentKPI._id } as any }];

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

    private _subscribeToNameChanges() {
        this.vm.fg.controls['name'].valueChanges.subscribe(n => {
            const nameInput = n.trim();

            if (nameInput === '') {
                this.vm.fg.controls['name'].setErrors({ required: true });
            } else {
                if (this.vm.getExistDuplicatedName() === true) {
                    this._apolloService.networkQuery<IKPI>(getKPIByName, { name: nameInput }).then(d => {
                        if (!((d.kpiByName && this.resultName === 'createKPI') ||
                            (d.kpiByName && this.resultName === 'updateKPI' && d.kpiByName._id !== this.payload.id))) {

                            this.vm.fg.controls['name'].setErrors(null);
                        } else {
                            this.vm.fg.controls['name'].setErrors({ forbiddenName: true });
                        }
                    });
                }
            }
        });
    }

    private _goToListKpis() {
        this._router.navigateByUrl('/kpis/list');
    }

    private _getExternalDataSources() {
        const that = this;

        this._apolloService.networkQuery<{ externalDataSources: IExternalDataSource[] }>(externalDataSourcesQuery)
            .then(res => {
                that.vm.updateDataSources(res.externalDataSources);
            });
    }
}
