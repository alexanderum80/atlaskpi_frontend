import { SelectPickerComponent } from '../../../ng-material-components/modules/forms/select-picker/select-picker.component';
import { Component, Input, ViewChild, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import SweetAlert from 'sweetalert2';

import { IExternalDataSource } from '../../../shared/domain/kpis/data-source';
import { IKPI } from '../../../shared/domain/kpis/kpi';
import { ApolloService } from '../../../shared/services/apollo.service';
import { ExternalSourceKpiFormViewModel } from './external-source-kpi-form.viewmodel';
import { AfterViewInit } from '@angular/core/src/metadata/lifecycle_hooks';
import { IKPIPayload } from '../shared/simple-kpi-payload';

const externalDataSourcesQuery = require('./external-data-sources.query.gql');
const addExternalSourceKpiMutation = require('./add-external-source-kpi.mutation.gql');
const updateExternalSourceKpiMutation = require('./update-external-source-kpi.mutation.gql');
const getKPIByName = require('../kpi-by-name.gql');

@Component({
  selector: 'kpi-external-source-kpi-form',
  templateUrl: './external-source-kpi-form.component.pug',
  styleUrls: [ './external-source-kpi-form.component.scss'],
  providers: [ExternalSourceKpiFormViewModel]
})
export class ExternalSourceKpiFormComponent implements OnInit, AfterViewInit {
    @Input() model: IKPI;

    @ViewChild('numericFieldSelector') set content(content: SelectPickerComponent) {
        if (content) {
            this.vm.numericFieldSelector = content;
        }
    }

    isCollapsedAritmeticOperation = true;
    isCollapsedFilters = true;
    payload: IKPIPayload;
    mutation: string;
    resultName: string;

    constructor(
        public vm: ExternalSourceKpiFormViewModel,
        private _apolloService: ApolloService,
        private _router: Router
    ) {}

    ngOnInit(): void {
        this.vm.initialize(this.model);
        this._getExternalDataSources();
    }

    ngAfterViewInit() {
        this._subscribeToNameChanges();
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

        this._apolloService.networkQuery < IKPI > (getKPIByName, { name: this.payload.input.name }).then(d => {
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

                this._router.navigateByUrl('/kpis/list');
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
            if (res.dismiss !== 'cancel') {
                that._goToListKpis();
            }
        });
    }

    private _subscribeToNameChanges() {
        this.vm.fg.controls['name'].valueChanges.subscribe(n => {
            const nameInput = n.trim();

            if (nameInput === '') {
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
