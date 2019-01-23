import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { IFunnelStage, IFunnel } from '../shared/models/funnel.model';
import { FormGroupTypeSafe, FormBuilderTypeSafe } from '../../shared/services';
import { FormArray, Validators } from '../../../../node_modules/@angular/forms';
import { IChartDateRange, IDateRange } from '../../shared/models';
import { SelectionItem, guid } from '../../ng-material-components';
import { FunnelService } from '../shared/services/funnel.service';
import { ChooseColorsComponent } from '../../shared/ui/choose-colors/choose-colors.component';
import { Subscription } from 'rxjs/Subscription';
import { IKpiDateRangePickerDateRange } from '../shared/models/models';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';


enum FunnelColorElementEnum {
  foreground = 'foreground',
  background = 'background'
}

@Component({
  selector: 'kpi-stage-form',
  templateUrl: './stage-form.component.pug',
  styleUrls: ['./stage-form.component.scss']
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

    @Output() stageRemoved = new EventEmitter<IFunnelStage>();

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
                    const index = originalStageList.findIndex(s => s.id === this._stageModel.id);
                    return originalStageList.filter((x, i) => x.id !== this.stageModel.id && i < index);
                })
            );
    }

    ngOnDestroy() {
        this.subscriptions.forEach(s => s.unsubscribe());
        const filterIndex = this.parentFormArray.controls.findIndex(c => c === this.fg);
        if (filterIndex > -1) { this.parentFormArray.removeAt(filterIndex); }
    }

    removeStage(): void {
      this.stageRemoved.emit(this._stageModel);
    }

    openSelectColor(element: FunnelColorElementEnum) {
        this.selectedColorElement = element;
        this.chooseColors.open();
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

    private _createStageFormGroup(): FormGroupTypeSafe<IFunnelStage> {
        return this.fb.group<IFunnelStage>({
            id: [guid()],
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
            }),
            fieldsToProject: [null],
            compareToStage: [null],
            foreground: ['#fff', Validators.required],
            background: ['#7cb5ec', Validators.required],
        });
    }

    private _updateStageFormGroup(value: IFunnelStage) {

        if (!value) { return this.fg.reset(); }

        const {
          id = '',
          name = '',
        } = value || {};

        this.fg.patchValueSafe({
            name,
        });
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
