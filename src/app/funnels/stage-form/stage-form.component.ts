import { Component, OnDestroy, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { IFunnelStage, IFunnel } from '../shared/models/funnel.model';
import { FormGroupTypeSafe, FormBuilderTypeSafe } from '../../shared/services';
import { FormArray, Validators } from '../../../../node_modules/@angular/forms';
import { IChartDateRange, IDateRange } from '../../shared/models';
import { SelectionItem, guid } from '../../ng-material-components';
import { FunnelService } from '../shared/services/funnel.service';
import { ChooseColorsComponent } from '../../shared/ui/choose-colors/choose-colors.component';

enum FunnelColorElementEnum {
  foreground = 'foreground',
  background = 'background'
}

@Component({
  selector: 'kpi-stage-form',
  templateUrl: './stage-form.component.pug',
  styleUrls: ['./stage-form.component.scss']
})
export class StageFormComponent implements OnDestroy {

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
    dateRangeSelectionList: SelectionItem[] = [];

    selectedColorElement: FunnelColorElementEnum;

    private formControlIndex;

    constructor(
      private fb: FormBuilderTypeSafe,
      private funnelService: FunnelService
    ) {
      this.fg = this._createStageFormGroup();
      this.kpiSelectionList = funnelService.kpiSelectionList;
      // this.dateRangeSelectionList = funnelService.dateRangeSelectionList;
    }

    ngOnDestroy() {
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
              predefinedDateRange: [null],
              from: [null],
              to: [null]
            }),
            fieldsToProject: [null],
            compareToStage: [null],
            foreground: [null, Validators.required],
            background: [null, Validators.required],
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

    get showCustomDateRangeControl(): boolean {
      return this.fg
                 .getSafe(c => c.dateRange)
                 .value['predefined'] === 'custom';
    }



}
