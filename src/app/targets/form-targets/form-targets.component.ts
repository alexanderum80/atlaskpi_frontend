import { Component, Input, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';

import { ITargetNew } from '../shared/models/targets.model';
import { FormTargetsViewModel } from './form-targets.viewmodel';
import { ApolloService } from '../../shared/services/apollo.service';
import { BasicTargetsComponent } from '../basic-targets/basic-targets.component';
import { UserService } from '../../shared/services/user.service';
import * as moment from 'moment-timezone';
import { filter } from 'lodash';

import { ListTargetsComponent } from '../list-targets/list-targets.component';
import { IListItem } from '../../shared/ui/lists/list-item';
import { MilestoneComponent } from '../milestone/milestone.component';
import { Subscription } from 'rxjs';
import { RelatedUsersComponent } from '../related-users/related-users.component';
import { FormControl } from '@angular/forms';
import { Apollo } from 'apollo-angular';
import { ITargetFormFields } from '../../charts/chart-view/set-goal/shared/target.service';
import { ITarget } from '../../charts/chart-view/set-goal/shared/targets.interface';

const targesQuery = require('graphql-tag/loader!./list-targets.gql');
const addTargetsMutation = require('graphql-tag/loader!./add-targets.gql');
const editTargetsMutation = require('graphql-tag/loader!./update-targets.gql');
const trargetByName = require('graphql-tag/loader!./target-by-name.gql');

const updateTarget = require('graphql-tag/loader!./update-target.mutation.gql');
const createTarget = require('graphql-tag/loader!./create-target.mutation.gql');
const findTargetByName = require('graphql-tag/loader!./find-target-by-name.gql');
const removeTarget = require('graphql-tag/loader!./remove-target.gql');

@Component({
  selector: 'kpi-form-targets',
  templateUrl: './form-targets.component.pug',
  styleUrls: ['./form-targets.component.scss'],
  providers: [FormTargetsViewModel]
})
export class FormTargetsComponent implements OnInit {
  // @Input() model: ITargetNew ;
  @Input() chart: any;
  // @Input() widget: any;

  @ViewChild ('listTarget') listTarget: ListTargetsComponent;
  @ViewChild ('basic') basicForm: BasicTargetsComponent;
  @ViewChild ('milestoneComponent') milestoneComponent: MilestoneComponent;
  @ViewChild ('related') relatedComponent: RelatedUsersComponent;

  @Output() onCancel = new EventEmitter<any>();

  targat: any;
  targets: ITargetNew[];
  valuePerc = true;
  item: IListItem;
  listLoad = false;
  tabIndex = 1;
  isCustom = false;

  valid = false;

  private type: string;
  private identifier: string;
  private totalTabs = 3;
  private currentUser: string;

  private _subscription: Subscription[] = [];

  constructor(public vm: FormTargetsViewModel,
    private _apolloService: ApolloService,
    private _apollo: Apollo,
    private userService: UserService) {

  }

  ngOnInit(): void {
    const that = this;
    this.vm.initialize(null);
    that.vm.fg.addControl('period', new FormControl(that.vm.period));
    that.initialModel();
    that._refreshTargets();
  }

  setIndex(index: number) {
    if (index < 1 && index > this.totalTabs) {
      return;
    }

    this.tabIndex = index;
  }

  activeIndex(index: number): boolean {
    return this.tabIndex === index;
  }

  goNext() {
    if (this.tabIndex < this.totalTabs) {
      this.tabIndex += 1;
    }
  }

  goBack() {
    if (this.tabIndex > 1) {
      this.tabIndex -= 1;
    }
  }

  canGoBack() {
    return this.tabIndex > 1;
  }

  canGoNext() {
    return this.tabIndex < this.totalTabs;
  }

  add(event) {
    this.vm.activeVisble = false;
    this.vm.fg.controls['_id'].setValue('');
    this.vm.fg.controls['name'].setValue('');
    this.vm.value = null;
    this.vm.fg.controls['recurrent'].setValue(false);
    this._complitedGroupings(true);
    this._complitedFrequency(true);
  }

  edit(id) {
    this.vm.activeVisble = true;
    const target = filter( this.targets,  {'_id': id});
    this.vm.target = target;
    this.vm.fg.controls['_id'].setValue(id);
    this.vm.fg.controls['name'].setValue(target[0].name);
    this.vm.fg.controls['unit'].setValue(target[0].unit);
    this.vm.fg.controls['type'].setValue(target[0].type);
    this.vm.fg.controls['value'].setValue(target[0].value);
    this.vm.fg.controls['compareTo'].setValue(target[0].compareTo);
    this.vm.fg.controls['recurrent'].setValue(target[0].recurrent);
    this.vm.fg.controls['active'].setValue(target[0].active === 'true' ? true : false);
    if (target[0].reportOptions.groupings) {
      this.vm.grouping  = this.targets[0].reportOptions.groupings;
    }

    if (target[0].reportOptions.frequency) {
      this.vm.fg.controls['recurrent'].setValue(target[0].reportOptions.frequency);
    }
  }


  selectItem(event) {
    this.vm.fg.controls._id.setValue(event.id);
    this.edit(event.id);
    this.milestoneComponent.refresh(event.id);
  }


  cancel() {
        this.onCancel.emit({click: 'cancel', mode: 'view'});
  }

  save(): void {
    if (!this.vm.valid) {
      return;
    }

    if (this.vm.valid) {
       this.vm._id === '' || this.vm._id === null || this.vm._id === undefined ?
         this.actionAdd() : this.actionEdit();
    }

  }

  onDelete(event) {
    this._apolloService.networkQuery < ITargetNew > (findTargetByName, {'name': this.vm.name})
    .then(res => {
      this.deleteOld(res.findTargetByName._id);
     })
    .catch(err =>
      this._displayServerErrors(err)
    );
    this._refreshTargets();
  }

  deleteOld(id) {
    this._apolloService.mutation < ITargetNew > (removeTarget, {
      'id': id,
      'owner': this.userService.user._id })
    .then(res => {
    })
    .catch(err => {
        this._displayServerErrors(err) ;
    });
  }

  setUpdate(id) {
      const that = this;
      const visible = this.vm.users[0].id;
      const fields: ITargetFormFields = {
        name: this.vm.name,
        datepicker: this.chart.frequency ? that.nextDueDate(this.chart.frequency) : that.nextDueDate(this.chart.predefined),
        vary:  this.vm.type,
        amount: this.vm.value,
        amountBy: this.vm.unit === 'value' ? 'dollar' : 'percent',
        active:  true,
        type: 'spline',
        period: this.vm.compareTo,
        visible: [ visible ],
        nonStackName: this.chart.frequency ? this.chart.frequency : 'all' ,
        stackName: this.chart.frequency ? '' : this.vm.fg.controls['groupings'].value,
        owner: this.vm.owner,
        chart: [this.chart._id]
    };

      this._apollo.mutate({
          mutation: updateTarget,
          variables: {
            id: id,
            data: fields
          },
          refetchQueries: [
            'Chart'
          ]
        })
        .toPromise()
        .then(({data}) => {
          that.onCancel.emit({click: 'save', mode: 'view'});
        });
  }

  setAdd() {
    const that = this;
    const visible = this.vm.users[0].id;
    const fields: ITargetFormFields = {
      name: this.vm.name,
      datepicker: this.chart.frequency ? that.nextDueDate(this.chart.frequency) : that.nextDueDate(this.chart.predefined),
      vary:  this.vm.type,
      amount: this.vm.value,
      amountBy: this.vm.unit === 'value' ? 'dollar' : 'percent',
      active:  true,
      type: 'spline',
      period: this.vm.compareTo,
      visible: [ visible ],
      nonStackName: this.chart.frequency ? this.chart.frequency : 'all' ,
      stackName: this.chart.frequency ? '' : this.vm.fg.controls['groupings'].value,
      owner: this.vm.owner,
      chart: [this.chart._id]
  };

  this._apollo.mutate({
    mutation: createTarget,
    variables: {
      data: fields
    },
  })
  .toPromise()
  .then(({data}) => {
    that.onCancel.emit({click: 'save', mode: 'view'});
  });

}

  private initialModel() {
    const that = this;
    this.vm.owner = this.userService.user._id;
    if (that.chart) {
      that.type = 'chart';
      that.identifier = that.chart._id;

      that.vm.source[0] =  {
        type: 'chart',
        identifier: that.chart._id
      };

      that.vm.kpi = that.chart.kpis[0]._id;
    }

  }

  private _complitedGroupings(add?) {
    const that = this;
    if (add === true) {
      this.vm.grouping = 'NOTHING SELECTED';
      this.vm.fg.controls.groupings.setValue('');
    } else if (this.targets[0].reportOptions.groupings) {
      this.vm.grouping  = this.targets[0].reportOptions.groupings;
    }

    if (that.chart.groupings.length > 0 && that.chart.groupings[0] !== '' ) {
      that.vm.setGroupings(this.chart.groupings);
      that.vm.visbleGroupings = true;
    } else {
      that.vm.visbleGroupings = false;
    }

  }

  private _complitedFrequency(add?) {
    const that = this;

    if (that.chart.frequency !== '' && that.chart.frequency !== null && that.chart.frequency !== undefined  ) {
      if (add === true) {
        this.vm.period = '';
      } else if (this.targets[0].reportOptions.frequency) {
        this.vm.period  = this.targets[0].reportOptions.frequency;
      }
      const frequency = that.chart.frequency;
      const predefined = that.chart.dateRange[0].predefined;

      if (predefined === 'custom') {
        that.isCustom = true;
        that.vm.fg.controls['compareTo'].setValue('Previous Period');
      } else {
        that.isCustom = false;
      }

      that.vm.baseOnLists(frequency);
      that.vm.setTargetPeriod(frequency, predefined);
    }

  }



  private _refreshTargets(id?: string) {
    const that = this;

    const source = {
      'source': {
        'identifier': that.identifier,
        'type': that.type
      }
    };

    this._apolloService.networkQuery < ITargetNew[] > (targesQuery, source).then(d => {
        that.targets = d.targetBySource || [];

        if (that.targets.length === 0) {
          that.listLoad = false;
          that._complitedFrequency(true);
          that._complitedGroupings(true);
        } else {
          that.listLoad = true;

          if (id === '' || id === null || id === undefined ) {
              that.vm.fg.controls._id.setValue(that.targets[0]._id);
          } else {
              that.vm.fg.controls._id.setValue(id);
          }
          that.item = { id : that.vm.fg.controls._id.value, selected: true} ;
          if (that.listTarget !== undefined) {
            that.listTarget.getTargets(that.targets);
            that.listTarget.itemClicked(that.item );
            that.selectItem(that.item);
          }
          that._complitedFrequency();
          that._complitedGroupings();
          that.edit(that.vm.fg.controls._id.value);
        }
      });

  }

  private actionAdd() {
    const that = this;
    const input =  this.prepareModel();
    this._apolloService.mutation < ITargetNew > (addTargetsMutation, {'TargetInput': input})
    .then(res => {
      that.getId();
    })
    .catch(err => this._displayServerErrors(err));
    that.setAdd();
  }

  private getId() {
    const that = this;
    this._apolloService.networkQuery < ITargetNew > (trargetByName, {'name': that.vm.name})
    .then(res => {
      that._refreshTargets(res.targetByName._id);
     })
    .catch(err =>
      this._displayServerErrors(err)
    );
  }

  private actionEdit() {
    const that = this;
    const input = this.prepareModel();
    this._apolloService.mutation < ITargetNew > (editTargetsMutation, {'id': this.vm._id, 'TargetInput': input })
    .then(res => {
      this._refreshTargets(this.vm._id);
    })
    .catch(err => {
        this._displayServerErrors(err) ;
    });

    this._apolloService.networkQuery < ITargetNew > (findTargetByName, {'name': that.vm.name})
    .then(res => {
      this.setUpdate(res.findTargetByName._id);
     })
    .catch(err =>
      this._displayServerErrors(err)
    );
  }

  private prepareModel() {
    let user = [];
    let index = 0;
    this.vm.users.forEach(element => {
      let deliveryMethodArray = [];
      if (element['email'] === true) {
        deliveryMethodArray.push('email');
      }

      if (element['push'] === true) {
        deliveryMethodArray.push('push');
      }

      user[index++] = { id: element.id, deliveryMethod:  deliveryMethodArray };
    });

    const timezone = this.userService.user.profile.timezone;

    let filter: any;

    this.chart.kpis[0].filter ? filter = JSON.stringify(this.chart.kpis[0].filter) : filter = '';

    const TargetNewInput =  {
      'name': this.vm.name,
      'kpi': this.vm.kpi,
      'compareTo': this.vm.compareTo ,
      'recurrent': this.vm.recurrent ? true : false ,
      'type': this.vm.type,
      'value': Number(String(this.vm.value).replace(/,/g, '')),
      'unit': this.vm.unit,
      'owner': this.vm.owner,
      'active': this.vm.active ? true : false,
      'selected': this.vm.selected ? true : false,
      'reportOptions': {
        'frequency': this.chart.frequency,
        'groupings': this.vm.groupings || '' ,
        'timezone': timezone ,
        'dateRange': {
          'from': this.chart.dateRange[0].custom.from !== null ? this.chart.dateRange[0].custom.from : '',
          'to': this.chart.dateRange[0].custom.to !== null ? this.chart.dateRange[0].custom.to : '',
        },
        'filter':  filter
      },
      'source': {
        'type': this.type,
        'identifier': this.identifier
      },
      'notificationConfig': {
        'notifiOnPercente': [Number(String(this.vm.value).replace(/,/g, ''))],
        'users': user
      }
    };
    return TargetNewInput;
  }

  private _displayServerErrors(err) {
        console.log('Server errors: ' + JSON.stringify(err));
  }

  private nextDueDate(frequency) {
    let dueDate: any;

    switch (frequency) {
        case 'monthly':
                dueDate = moment().endOf('month').toDate();
            break;
        case 'yearly':
                dueDate = moment().endOf('year').toDate() ;
            break;
        case 'quarterly':
                dueDate =  moment().endOf('quarter').toDate();
            break;
    }

    return moment(String(dueDate)).format('MM/DD/YYYY') ;
}


}
