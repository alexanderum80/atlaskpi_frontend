import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { AfterViewInit } from '@angular/core/src/metadata/lifecycle_hooks';
import { Router } from '@angular/router';
import SweetAlert from 'sweetalert2';
import { ModalComponent } from '../../../ng-material-components/modules/user-interface/modal/modal.component';

import { IDataSource } from '../../../shared/domain/kpis/data-source';
import { IKPI } from '../../../shared/domain/kpis/kpi';
import { ApolloService } from '../../../shared/services/apollo.service';
import { IKPIPayload } from '../shared/simple-kpi-payload';
import { ComplexKpiFormViewModel } from './complex-kpi-form.viewmodel';

import { IWidget } from '../../../widgets/shared/models';


const kpisQuery = require('graphql-tag/loader!../kpis.gql');
const kpiByName = require('graphql-tag/loader!../kpi-by-name.gql');
const datasourcesQuery = require('graphql-tag/loader!../data-sources.gql');
const addKpiMutation = require('graphql-tag/loader!../add-kpi.mutation.gql');
const updateKpiMutation = require('graphql-tag/loader!../update-kpi.mutation.gql');
const getKpiFilterExpressionQuery = require('graphql-tag/loader!../kpi-filter-expression.gql');

// App Code
@Component({
    selector: 'kpi-complex-kpi-form',
    templateUrl: './complex-kpi-form.component.pug',
    styleUrls: ['./complex-kpi-form.component.scss'],
    providers: [ComplexKpiFormViewModel]
})
export class ComplexKpiFormComponent implements OnInit, AfterViewInit {
    @Input() model: IKPI;
    @Input() clone = false;
    @ViewChild('previewModal') previewModal: ModalComponent;

    payload: IKPIPayload;
    mutation: string;
    resultName: string;

    fromSaveAndVisualize: boolean;
    currrentKPI: IKPI;
    widgetModel: IWidget;
    newWidgetFromKPI: boolean;
    newChartFromKPI: boolean;

    constructor(
        public vm: ComplexKpiFormViewModel,
        private _apolloService: ApolloService,
        private _router: Router,
    ) { }

    ngOnInit(): void {
        const that = this;
        SweetAlert.close();
        this.vm.initialize(this.model);

        this._apolloService.networkQuery(kpisQuery).then(res => {
            that.vm.updateKpis(res.kpis);
        });

        this._apolloService.networkQuery<{ dataSources: IDataSource[] }>(datasourcesQuery)
            .then(res => {
                that.vm.updateDataSources(res.dataSources);
            });

        this.vm.updateExistDuplicatedName(false);
    }

    ngAfterViewInit() {
        this._subscribeToNameChanges();
    }

    update(model: IKPI): void {
        this.vm.update(model);
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
        const that = this;

        that.payload = this.vm.payload;
        that.mutation = that.payload.id ? updateKpiMutation : addKpiMutation;
        that.resultName = that.payload.id ? 'updateKPI' : 'createKPI';

        this.vm.updateExistDuplicatedName(false);

        if (!this.vm.fg.valid) {
            return SweetAlert({
                title: 'Make sure you entered all required information before you save this KPI.',
                type: 'error',
                showConfirmButton: true,
                confirmButtonText: 'Got it!'
            });
        }

        if (!this.vm.validExpression()) {
            const message: string = 'Your KPI expression is invalid. At this point, we only allow KPIs' +
                ', and operations (i.e. / * + -) between them such as, @{Revenue}-@{Expenses}';
            return SweetAlert({
                text: message,
                type: 'error',
                showConfirmButton: true,
                confirmButtonText: 'Got it!'
            });
        }

        this._apolloService.networkQuery<IKPI[]>(kpiByName, { name: that.payload.input.name }).then(d => {
            if ((d.kpiByName && that.resultName === 'createKPI') ||
                (d.kpiByName && that.resultName === 'updateKPI' && d.kpiByName._id !== that.payload.id)) {

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

                this._apolloService.mutation<any>(that.mutation, that.payload)
                .then(res => {
                    if (res.data[that.resultName].errors) {
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
                        this.vm.valuesPreviewChart.kpiIds = [this.currrentKPI._id];

                        this.fromSaveAndVisualize = !this.fromSaveAndVisualize;
                        this.previewModal.open();
                    } else {
                        this._goToListKpis();
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
                    this._apolloService.networkQuery<IKPI>(kpiByName, { name: nameInput }).then(d => {
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

}
