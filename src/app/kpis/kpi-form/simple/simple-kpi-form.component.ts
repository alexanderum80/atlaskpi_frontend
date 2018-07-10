// Angular Import
import { SelectPickerComponent } from '../../../ng-material-components/modules/forms/select-picker/select-picker.component';
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
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
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
import { Apollo } from 'apollo-angular';

const dataSources = require('../data-sources.gql');
const tags = require('./tags.gql');
const addKpiMutation = require('../add-kpi.mutation.gql');
const updateKpiMutation = require('../update-kpi.mutation.gql');

const getKPIByName = require('../kpi-by-name.gql');
const sourceQuery = require('./get-source-Query.gql');

// App Code
@Component({
    selector: 'kpi-simple-kpi-form',
    templateUrl: './simple-kpi-form.component.pug',
    styleUrls: [ './simple-kpi-form.component.scss' ]
})
export class SimpleKpiFormComponent implements OnInit, AfterViewInit, OnDestroy {
    @Input() model: IKPI;
    @Input() editing: boolean;
    @Input() clone: boolean;

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

    vm: SimpleKpiFormViewModel;

    private _subscription: Subscription[] = [];

    constructor(
        // public vm: SimpleKpiFormViewModel,
        private _apolloService: ApolloService,
        private _apollo: Apollo,
        private _router: Router,
        private _cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        this._getDataSources();
    }

    ngAfterViewInit() {
        this._subscribeToNameChanges();
    }

    ngOnDestroy() {
        CommonService.unsubscribe(this._subscription);
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
                that.vm = new SimpleKpiFormViewModel(that._apollo);

                that._getTags();

                that.vm.updateExistDuplicatedName(false);

                that.vm.initialize(that.model);
                that.vm.updateDataSources(res.dataSources);
            });
    }

    private _getTags() {
        const that = this;
        this._apolloService.networkQuery<{ tags: ITag[] }>(tags)
            .then(res => {
                that.vm.updateTags(res.tags);
            });
    }
}
