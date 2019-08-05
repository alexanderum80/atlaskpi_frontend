import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Validators, FormArray } from '@angular/forms';
import { IFunnel, IFunnelStage } from '../shared/models/funnel.model';
import { FormBuilderTypeSafe, FormGroupTypeSafe, CommonService } from '../../shared/services';
import { SelectionItem, guid } from '../../ng-material-components';
import { FunnelService } from '../shared/services/funnel.service';
import { Subscription } from 'rxjs/Subscription';
import { FunnelModule } from '../funnel.module';

@Component({
  selector: 'kpi-funnel-form',
  templateUrl: './funnel-form.component.pug',
  styleUrls: ['./funnel-form.component.scss']
})
export class FunnelFormComponent implements OnInit, OnDestroy {
    private _funnelModel: IFunnel;
    @Input('funnelModel')
    set funnelModel(value: IFunnel) {
        this._funnelModel = value;
        this._updateFunnelFormGroup(value);
        this.funnelService.emitStagesList();
    }
    get funnelModel(): IFunnel { return this._funnelModel; }

    userSelectionList: SelectionItem[] = [];

    private _fg: FormGroupTypeSafe<IFunnel>;
    get fg(): FormGroupTypeSafe<IFunnel> {
        return this._fg;
    }

    subscriptions: Subscription[] = [];

    constructor(
        private funnelService: FunnelService,
        private fb: FormBuilderTypeSafe,
    ) {
        this._fg = this._createFunnelFormGroup();
    }

    ngOnInit() {
        this.funnelService.fg = this._fg;

        this.userSelectionList = this.funnelService.userSelectionList;

        this.subscriptions.push(
            this.fg
                .getSafe(s => s.name)
                .valueChanges
                .distinctUntilChanged()
                .debounceTime(500)
                .subscribe(n => this.funnelService.updateFunnelName(n)),

            this.fg
                .valueChanges
                .distinctUntilChanged()
                .debounceTime(1000)
                .subscribe(v  => {
                    if (!this.fg.valid) {
                        this.funnelService.performFunnelInvalidFlow();
                        return;
                    }

                    this.funnelService.renderFunnelByDefinition(v);
                }),
        );

        if (!this._funnelModel.stages || !this._funnelModel.stages.length) {
            this.funnelService.addStage();
        }
    }

    ngOnDestroy() {
        CommonService.unsubscribe(this.subscriptions);
        this.funnelService.performFunnelInvalidFlow();
    }

    addStage(): void {
        this.funnelService.addStage();
    }

    removeStage(stage: IFunnelStage) {
        this.funnelService.removeStage(stage);
    }

    private _createFunnelFormGroup(): FormGroupTypeSafe<IFunnel> {
        return this.fb.group<IFunnel>({
            _id: [null],
            name: [null, Validators.required],
            users: [null],
            stages: this.fb.array([], Validators.required)
        });
    }

    private _updateFunnelFormGroup(value: IFunnel) {
        const {
            _id = '',
            name = '',
            users = [],
        } = value || {};

        const delimitedUsers = users && users.join('|') as any;

        this.fg.patchValue({
            _id,
            name,
            users: delimitedUsers
        });

    }

}
