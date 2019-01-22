import { Component, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { IFunnelStage, IFunnel } from '../shared/models/funnel.model';
import { FormGroupTypeSafe, FormBuilderTypeSafe } from '../../shared/services';
import { FormArray, Validators } from '../../../../node_modules/@angular/forms';

@Component({
  selector: 'kpi-stage-form',
  templateUrl: './stage-form.component.pug',
  styleUrls: ['./stage-form.component.scss']
})
export class StageFormComponent implements OnDestroy {
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

    fg: FormGroupTypeSafe<IFunnelStage>;
    private formControlIndex;

    constructor(
      private fb: FormBuilderTypeSafe
    ) {
      this.fg = this._createStageFormGroup();
    }

    ngOnDestroy() {
      const filterIndex = this.parentFormArray.controls.findIndex(c => c === this.fg);
      if (filterIndex > -1) { this.parentFormArray.removeAt(filterIndex); }
    }

    removeStage(): void {
      this.stageRemoved.emit(this._stageModel);
    }

    private _createStageFormGroup(): FormGroupTypeSafe<IFunnelStage> {
        return this.fb.group<IFunnelStage>({
            name: [null, Validators.required],
            kpi: [null, Validators.required],
            dateRange: [null, Validators.required],
            selectedFields: [null],
            compareToStage: [null],
            foreground: [null, Validators.required],
            background: [null, Validators.required],
        });
    }

    private _updateStageFormGroup(value: IFunnelStage) {

        if (!value) { return this.fg.reset(); }

        const {
          order = 1,
          name = '',
        } = value || {};

        this.fg.patchValueSafe({
            name,
        });
    }



}
