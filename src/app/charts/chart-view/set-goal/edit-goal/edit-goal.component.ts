import { TargetFormComponent } from '../target-form/target-form.component';
import { TargetModel } from '../shared/models/target.model';
import { MenuItem, SelectionItem, ModalComponent } from '../../../../ng-material-components';
import { Component, EventEmitter, Input, Output, OnInit, ViewChild } from '@angular/core';
import { ITarget } from '../shared/targets.interface';
import { Apollo } from 'apollo-angular/';
import { FormGroup } from '@angular/forms';
import { TargetService } from '../shared/target.service';
import { targetApi } from './graphqlActions/edit-goal-actions';
import { ApolloService } from '../../../../shared/services/apollo.service';
import Sweetalert from 'sweetalert2';
import { isEmpty } from 'lodash';

const targetByNameQuery = require('graphql-tag/loader!../graphql/get-target-by-name.query.gql');

@Component({
  selector: 'kpi-edit-goal',
  templateUrl: './edit-goal.component.pug'
})
export class EditGoalComponent implements OnInit {
  @ViewChild('targetModal') targetModal: ModalComponent;
  @ViewChild(TargetFormComponent) targetFormComponent: TargetFormComponent;

  @Input() selectedTarget: any;
  @Input() chartHelper: any;

  @Input() stackList: SelectionItem[];
  @Input() nonStackList: SelectionItem[];

  @Output() onTarget = new EventEmitter<any>();

  fg: FormGroup = new FormGroup({});

  fgNotify: FormGroup = new FormGroup({});
  fgVisible: FormGroup = new FormGroup({});

  valueTypes: SelectionItem[];
  varyTypes: SelectionItem[];
  periodTypes: SelectionItem[];
  notificationDateList: SelectionItem[];

  targetTooltip = false;

  constructor(private _targetService: TargetService,
              private _apolloService: ApolloService,
              private _apollo: Apollo) {
    this.valueTypes = this._targetService.valueTypes;
    this.valueTypes.forEach(valueType => valueType.selected = false);
    this.varyTypes = this._targetService.varyTypes;
    this.varyTypes.forEach(varyType => varyType.selected = false);
    this.periodTypes = this._targetService.periodTypes;
    this.notificationDateList = this._targetService.notificationDateList;
    this.notificationDateList.forEach(dateList => dateList.selected = false);
  }

  ngOnInit() {
    this._targetService.isVaryPeriodValid(this.fg);
  }

  set() {
    const formFields = this.targetFormComponent.getFormFields(this.selectedTarget.target.chart[0]);

    this._apolloService.networkQuery < ITarget > (targetByNameQuery, { name: this.fg.controls['name'].value }).then(d => {
      if (this._checkForDuplicates(d)) {

          this._targetService.updateExistDuplicatedName(true);

          this.fg.controls['name'].setErrors({forbiddenName: true});

          return Sweetalert({
              title: 'Duplicated name!',
              text: 'You already have a Target with that name. Please change the name and try again.',
              type: 'error',
              showConfirmButton: true,
              confirmButtonText: 'Ok'
          });
      }
      if (formFields.nonStackName) {
        formFields.nonStackName = this._targetService.putBackCommaSelectPicker(this.nonStackList, formFields.nonStackName);
      }

      if (formFields.stackName) {
        formFields.stackName = this._targetService.putBackCommaSelectPicker(this.stackList, formFields.stackName);
      }
      const that = this;
      this._apollo.mutate({
          mutation: targetApi.update,
          variables: {
            id: this.selectedTarget.id,
            data: formFields
          },
          refetchQueries: [
            'Chart'
          ]
        })
        .toPromise()
        .then(({data}) => {
          const updateData = (<any>data).updateTarget;
          that.targetModal.close();
          that.onTarget.emit({click: 'save', mode: 'view'});
        });
    });
  }

  cancel(): void {
    this.targetModal.close();
    this.onTarget.emit({click: 'cancel', mode: 'view'});
  }

  updateEditForm(target: any) {
    this.targetFormComponent.updateTargetForm(target);
  }

  showToolTip(): void {
    this.targetTooltip = !this.targetTooltip;
  }

  closeToolTip(item: boolean): void {
    this.targetTooltip = item;
  }

  open(): void {
    this.targetModal.open();
  }

  get valid(): boolean {
    return this._targetService.isFormValid(this.fg, this.fgVisible, this.fgNotify);
  }

  private _checkForDuplicates(target): boolean {
    return !isEmpty(target.findTargetByName) &&
           target.findTargetByName._id &&
           target.findTargetByName._id !== this.selectedTarget.id;
  }

}
