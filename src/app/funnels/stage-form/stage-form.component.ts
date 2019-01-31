import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormArray, FormGroup, Validators } from '@angular/forms';
import { get } from 'lodash';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Subscription } from 'rxjs/Subscription';

import { SelectionItem } from '../../ng-material-components';
import { CommonService, FormBuilderTypeSafe, FormGroupTypeSafe } from '../../shared/services';
import { ChooseColorsComponent } from '../../shared/ui/choose-colors/choose-colors.component';
import { IFunnelStage } from '../shared/models/funnel.model';
import { IKpiDateRangePickerDateRange } from '../shared/models/models';
import { FunnelService } from '../shared/services/funnel.service';

export enum FunnelColorElementEnum {
  foreground = 'foreground',
  background = 'background'
}

function customDateRangeValidator() {
    return (group: FormGroup): {[key: string]: any} => {
      const predefined = group.controls['predefinedDateRange'];
      const from = group.controls['from'];
      const to = group.controls['to'];

      if (predefined.value !== 'custom') {
        return null;
      }

      if (!moment(from.value).isValid() || !moment(to.value).isValid()) {
          return {
              dateRangeInvalid: true
          };
      }
    };
}

@Component({
  selector: 'kpi-stage-form',
  templateUrl: './stage-form.component.pug',
  styleUrls: ['./stage-form.component.scss'],
})
export class StageFormComponent implements OnInit, OnDestroy {

    datePickerConfig = {
      showGoToCurrent: false,
      format: 'MM/DD/YYYY'
    };

    private _stageModel: IFunnelStage;
    get stageModel(): IFunnelStage { return this._stageModel; }
    @Input('stageModel')
    set stageModel(value: IFunnelStage) {
        this._stageModel = value;
        this._updateStageFormGroup(value);
    }

    private _parentFormArray: FormArray;
    get parentFormArray(): FormArray { return this._parentFormArray; }
    @Input('parentFormArray') set parentFormArray(value: FormArray) {
        this._parentFormArray = value;
        value.push(this.fg);
    }

    @Output() removeStage = new EventEmitter<IFunnelStage>();

    @ViewChild(ChooseColorsComponent) chooseColors: ChooseColorsComponent;

    fg: FormGroupTypeSafe<IFunnelStage>;

    kpiSelectionList: SelectionItem[];
    fieldSelectionList: SelectionItem[] = [];
    compareToStageList$: Observable<SelectionItem[]>;

    selectedColorElement: FunnelColorElementEnum;

    subscriptions: Subscription[] = [];

    private _lastKpiDateRangePayload;

    constructor(
      private fb: FormBuilderTypeSafe,
      private _funnelService: FunnelService
    ) {
        this.fg = this._createStageFormGroup();
    }

    ngOnInit() {
        this.kpiSelectionList = this._funnelService.kpiSelectionList;

        this.subscriptions.push(
            this.fg.getSafe(f => f.kpi)
                .valueChanges
                .subscribe(v => this._updateAvailableFields({ kpi: v}))
        );

        this.subscriptions.push(
            this.fg.getSafe(f => f.dateRange)
                .valueChanges
                .subscribe(v => this._updateAvailableFields({ dateRange: v}))
        );

        this.subscriptions.push(
            this.fg.getSafe(f => f.name)
                .valueChanges
                .distinctUntilChanged()
                .debounceTime(250)
                .subscribe(v => this._updateStageName(v))
        );

        this.compareToStageList$
            = this._funnelService.stagesSelectionList$.pipe(
                map(originalStageList => {
                    const index = originalStageList.findIndex((s => s.id === this._stageModel._id));
                    return originalStageList.filter((x, i) => x.id !== this.stageModel._id && i < index);
                })
            );
    }

    ngOnDestroy() {
        CommonService.unsubscribe(this.subscriptions);
        const filterIndex = this.parentFormArray.controls.findIndex(c => c === this.fg);
        if (filterIndex > -1) { this.parentFormArray.removeAt(filterIndex); }
    }

    onRemoveStage(): void {
      this.removeStage.emit(this._stageModel);
    }

    openSelectForegroundColor() {
        this.openSelectColor(FunnelColorElementEnum.foreground);
    }

    openSelectBackgroundColor() {
        this.openSelectColor(FunnelColorElementEnum.background);
    }

    onSelectColor(selectedColor: string) {
        switch (this.selectedColorElement) {
          case FunnelColorElementEnum.foreground:
              this.fg.getSafe(s => s.foreground).patchValue(selectedColor);
              break;

          case FunnelColorElementEnum.background:
              this.fg.getSafe(s => s.background).patchValue(selectedColor);
              break;
        }
    }

    private openSelectColor(element: FunnelColorElementEnum) {
        this.selectedColorElement = element;
        this.chooseColors.open();
    }

    private _createStageFormGroup(): FormGroupTypeSafe<IFunnelStage> {
        return this.fb.group<IFunnelStage>({
            _id: [null],
            order: [null],
            name: [null, Validators.required],
            kpi: [null, Validators.required],
            dateRange: this.fb.group<any>({
              // predefined: [null, Validators.required],
              // custom: this.fb.group<IDateRange>({
              //   from: [null],
              //   to: [null]
              // })
              predefinedDateRange: [null, Validators.required],
              from: [null],
              to: [null]
            }, { validator: customDateRangeValidator () }),
            fieldsToProject: [null, Validators.required],
            compareToStage: [null],
            foreground: [null, Validators.required],
            background: [null, Validators.required],
        });
    }

    private _updateStageFormGroup(value: IFunnelStage) {

        if (!value) { return this.fg.reset(); }

        const {
          _id = null,
          name = null,
          kpi = null,
          fieldsToProject = null,
          compareToStage = null,
          foreground = null,
          background = null,
        } = value || {};

        const dateRange = get(value, 'dateRange');

        const delimitedFieldsToProject = fieldsToProject && fieldsToProject.join('|') as any;

        this.fg.patchValueSafe({
            _id,
            name,
            kpi,
            compareToStage,
            foreground,
            background,
            fieldsToProject : delimitedFieldsToProject
        });


        const dateRangeFg = this.fg.getSafe(s => s.dateRange);

        dateRangeFg.patchValue({
            predefinedDateRange: get(dateRange, 'predefined') || null,
            from: get(dateRange, 'custom.from') || null ,
            to: get (dateRange, 'custom.to') || null
        }, { emitEvent: true });

        this._updateAvailableFields({ kpi, dateRange: dateRangeFg.value });
    }

    private async _updateAvailableFields(options: { kpi?: string, dateRange?: IKpiDateRangePickerDateRange }) {
        let { kpi = null, dateRange = null } = options;

        const formValue = this.fg.value;

        kpi = kpi || formValue.kpi;
        dateRange = dateRange || (formValue.dateRange as IKpiDateRangePickerDateRange);

        const selectedPayload = JSON.stringify({ kpi, dateRange });

        if (selectedPayload === this._lastKpiDateRangePayload) { return; }
        this._lastKpiDateRangePayload = selectedPayload;

        const res = await this._funnelService.getAvailableFields(kpi, dateRange);
        this.fieldSelectionList = res;
    }

    private _updateStageName(name: string) {
        this._funnelService.updateStage(this._stageModel, { name });
    }

    get showCustomDateRangeControl(): boolean {
      return this.fg
                 .getSafe(c => c.dateRange)
                 .value['predefined'] === 'custom';
    }

}
