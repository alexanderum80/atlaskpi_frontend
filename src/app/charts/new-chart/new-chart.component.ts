import { ValidateOption } from 'validate.js';
import { AfterViewInit, Component, OnInit, ViewChild, Inject, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Apollo } from 'apollo-angular';

import { AddChartActivity } from '../../shared/authorization/activities/charts/add-chart.activity';
import { Activity } from '../../shared/authorization/decorators/component-activity.decorator';
import { DialogResult } from '../../shared/models/dialog-result';
import { CreateChartMutation, CreateMapMutation } from '../shared/graphql/charts.gql';
import { ChartModel, ISaveChartResponse } from '../shared/models';
import { ChartFormComponent } from '../shared/ui/chart-form';
import { Store } from '../../shared/services/store.service';
import { ApolloService } from '../../shared/services/apollo.service';
import Sweetalert from 'sweetalert2';
import { IChart, SelectedChartsService } from '../shared';
import { SelectedMapsService } from '../shared/services';
import { ChartGalleryService } from '../shared/services';
import { FormControl } from '@angular/forms/src/model';
import { Validators } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import * as Promise from 'bluebird';
import { Input, Output, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { MapModel, IMap, ISaveMapResponse } from '../../maps/shared/models/map.models';
import { CommonService } from '../../shared/services';


const Highcharts = require('highcharts/js/highcharts');
const getChartByTitle = require('graphql-tag/loader!../shared/graphql/get-chart-by-title.gql');
const getMapByTitle = require('graphql-tag/loader!../shared/graphql/get-map-by-title.gql');

@Activity(AddChartActivity)
@Component({
  selector: 'kpi-new-chart',
  templateUrl: './new-chart.component.pug',
  styleUrls: ['./new-chart.component.scss'],
  providers: [ChartGalleryService, SelectedMapsService]
})
export class NewChartComponent implements OnInit, AfterViewInit, OnDestroy {
    @Input() isFromDashboard = false;
    @Input() chartType: string;
    @Output() result = new EventEmitter();
    @Input() chartDataFromKPI: any;
    @ViewChild(ChartFormComponent) private chartFormComponent: ChartFormComponent;
    fg: FormGroup = new FormGroup({});
    chartForm: FormGroup;
    chartModel: ChartModel;
    mapModel: MapModel;

    private readyToSave = false;
    private _subscription: Subscription[] = [];

    constructor(private _apollo: Apollo,
                private _apolloService: ApolloService,
                private _router: Router,
                private _store: Store,
                private _selectChartService: SelectedChartsService,
                private _selectMapService: SelectedMapsService,
                private _galleryService: ChartGalleryService,
                private fb: FormBuilder) {
    }

    ngOnInit() {
        // search in the appState
        const newChartInStore = this._store.pullDataObject('new-chart');
        this.chartModel = new ChartModel(newChartInStore || {});
        this.mapModel = new MapModel(newChartInStore || {});
        this._selectChartService.updateExistDuplicatedName(false);
        this._selectMapService.updateExistDuplicatedName(false);
    }

    ngAfterViewInit() {
        this._subscribeToNameChanges();
        setTimeout(() => {
            this.chartFormComponent.updateFormFields();
        }, 200);
    }

    ngOnDestroy() {
        CommonService.unsubscribe(this._subscription);
    }

    onChartFormEvent($event: DialogResult) {
        switch ($event) {
          case DialogResult.CANCEL:
            this.exitNewChart();
            break;
          case DialogResult.SAVE:
            if (this.fg.value.mapsize) {
                this.saveMap();
            } else {
                this.saveChart();
            }
            break;
        }
    }

    private exitNewChart() {
        if (this.isFromDashboard) {
            this.result.emit('charts');
        } else {
            if (this.chartDataFromKPI) {
                this._router.navigateByUrl('/kpis/list');
            } else {
                this._router.navigateByUrl('/charts');
            }
        }
    }

    saveChart() {
        const that = this;

        this._selectChartService.updateExistDuplicatedName(false);
        this._apolloService.networkQuery < IChart > (getChartByTitle, { title: this.fg.controls.name.value }).then(d => {
            if (d.getChartByTitle) {

                this._selectChartService.updateExistDuplicatedName(true);

                this.fg.controls['name'].setValue(this.fg.controls['name'].value);

                return Sweetalert({
                    title: 'Duplicated name!',
                    text: 'You already have a Chart with that name. Please change the name and try again.',
                    type: 'error',
                    showConfirmButton: true,
                    confirmButtonText: 'Ok'
                  });
            }

            this.chartFormComponent.processFormatChanges(this.fg.value);
            const model = ChartModel.fromFormGroup(this.fg, this.chartFormComponent.getChartDefinition(), true);

            if (!model.valid) {
                return;
            }
            this._apollo.mutate<ISaveChartResponse>({
                mutation: CreateChartMutation,
                variables: { input: model }
            })
            .toPromise()
            .then(response => {
                if (response.data.createChart.entity) {
                    this.exitNewChart();
                }

                if (response.data.createChart.errors) {
                    // perform an error message
                    console.log(response.data.createChart.errors);
                }
            })
            .catch(err => console.log(err));
        });
    }

    saveMap() {
        const that = this;
        this._selectMapService.updateExistDuplicatedName(false);
        this._apolloService.networkQuery <String> (getMapByTitle, { title: this.fg.controls.name.value })
        .then(d => {
            if (d.getMapByTitle) {
                this._selectMapService.updateExistDuplicatedName(true);
                this.fg.controls['name'].setValue(this.fg.controls['name'].value);

                return Sweetalert({
                    title: 'Duplicated name!',
                    text: 'You already have a Map with that name. Please change the name and try again.',
                    type: 'error',
                    showConfirmButton: true,
                    confirmButtonText: 'Ok'
                  });
            }

            const model = MapModel.fromFormGroup(this.fg);

            if (!model.valid) {
                return;
            }
            this._apollo.mutate<ISaveMapResponse>({
                mutation: CreateMapMutation,
                variables: { input: model }
            })
            .toPromise()
            .then(response => {
                if (response.data.createMap.entity) {
                    this.exitNewChart();
                }

                if (response.data.createMap.errors) {
                    // perform an error message
                    console.log(response.data.createMap.errors);
                }
            })
            .catch(err => console.log(err));
        });
    }

    private _subscribeToNameChanges() {
        this.fg.controls['name'].valueChanges.subscribe(name => {
            if (name === '') {
                this.fg.controls['name'].setErrors({required: true});
            } else {
                if (this._selectChartService.getExistDuplicatedName() === true) {
                    this._apolloService.networkQuery < IChart > (getChartByTitle, { title: name }).then(d => {
                        if (!d.getChartByTitle) {
                            this.fg.controls['name'].setErrors(null);
                        } else {
                            this.fg.controls['name'].setErrors({forbiddenName: true});
                        }
                    });
                }
            }
        });
    }
}
