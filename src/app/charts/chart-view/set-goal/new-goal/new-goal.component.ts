import { TargetFormComponent } from '../target-form/target-form.component';
import { TargetModel } from '../shared/models/target.model';
import { SelectionItem, ModalComponent } from '../../../../ng-material-components';
import {
    AfterViewInit,
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { ITarget } from '../shared/targets.interface';
import { Apollo } from 'apollo-angular/';
import { FormGroup } from '@angular/forms';
import { TargetService } from '../shared/target.service';
import { targetApi } from './graphqlActions/new-goal-actions';
import * as moment from 'moment';
import { ApolloService } from '../../../../shared/services/apollo.service';
import Sweetalert from 'sweetalert2';
import { isEmpty } from 'lodash';

const targetByNameQuery = require('../graphql/get-target-by-name.query.gql');

@Component({
  selector: 'kpi-new-goal',
  templateUrl: './new-goal.component.pug',
  styleUrls: ['./new-goal.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class NewGoalComponent implements OnInit, AfterViewInit {
  @ViewChild('targetModal') targetModal: ModalComponent;
  @ViewChild(TargetFormComponent) targetFormComponent: TargetFormComponent;

  @Input() currentUser: any;
  @Input() chartHelper: any;

  @Input() stackList: SelectionItem[];
  @Input() nonStackList: SelectionItem[];

  @Output() onTarget = new EventEmitter<any>();

  fg: FormGroup = new FormGroup({});
  fgNotify: FormGroup = new FormGroup({});
  fgVisible: FormGroup = new FormGroup({});

  targetTooltip = false;

  constructor(private _targetService: TargetService,
              private _apolloService: ApolloService,
              private _apollo: Apollo) { }

  ngOnInit() {
    if (this.stackList) {
      this.stackList = this._targetService.removeCommaSelectPicker(this.stackList);
    }
    if (this.nonStackList) {
      this.nonStackList = this._targetService.removeCommaSelectPicker(this.nonStackList);
    }

    this._targetService.isVaryPeriodValid(this.fg);
  }

  ngAfterViewInit() {
    setTimeout(() => {
      switch (this.chartHelper.frequency) {
        case 'weekly':
          this.fg.controls['period'].setValue('last week');
          this.fg.controls['datepicker'].setValue(moment().endOf('week').format('MM/DD/YYYY'));
          break;
        case 'daily':
          this.fg.controls['period'].setValue('yesterday');
          this.fg.controls['datepicker'].setValue(moment().format('MM/DD/YYYY'));
          break;
        case 'monthly':
          this.fg.controls['period'].setValue('last month');
          this.fg.controls['datepicker'].setValue(moment().endOf('month').format('MM/DD/YYYY'));
          break;
        case 'quarterly':
          this.fg.controls['period'].setValue('last quarter');
          this.fg.controls['datepicker'].setValue(moment().endOf('quarter').format('MM/DD/YYYY'));
          break;
        case 'yearly':
          this.fg.controls['period'].setValue('last year');
          this.fg.controls['datepicker'].setValue(moment().endOf('year').format('MM/DD/YYYY'));
          break;
      }
    }, 0);
  }

  set(): void {
    const that = this;

    this._apolloService.networkQuery < ITarget > (targetByNameQuery, { name: this.fg.controls['name'].value }).then(d => {
      if (!isEmpty(d.findTargetByName) && d.findTargetByName._id) {

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

      const formFields = this.targetFormComponent.getFormFields(this.chartHelper.id);
      if (formFields.nonStackName) {
        formFields.nonStackName = this._targetService.putBackCommaSelectPicker(this.nonStackList, formFields.nonStackName);
      }

      if (formFields.stackName) {
        formFields.stackName = this._targetService.putBackCommaSelectPicker(this.stackList, formFields.stackName);
      }

      this._apollo.mutate({
        mutation: targetApi.create,
        variables: {
          data: formFields
        },
        refetchQueries: [
          'Chart'
        ]
      })
      .toPromise()
      .then(({data}) => {
        that.targetModal.close();
        if (that.fgNotify) {
          that.fgNotify.reset();
          that.fg.reset();
        }
        this.onTarget.emit({click: 'save', mode: 'view'});
      });
    });
  }


  cancel(): void {
    this.targetModal.close();
    this.fgNotify.reset();
    this.fg.reset();
    this.onTarget.emit({click: 'cancel', mode: null});
  }

  showToolTip(): void {
    this.targetTooltip = !this.targetTooltip;
  }

  closeToolTip(item: boolean): void {
    this.targetTooltip = item;
  }

  modalClose(): void {
    this.targetModal.close();
  }

  open(): void {
    this.targetModal.open();
  }

  get valid(): boolean {
    return this._targetService.isFormValid(this.fg, this.fgVisible, this.fgNotify);
  }

}
