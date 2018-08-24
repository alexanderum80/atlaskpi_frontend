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

const targesQuery = require('graphql-tag/loader!./list-targets.gql');
const addTargetsMutation = require('graphql-tag/loader!./add-targets.gql');
const editTargetsMutation = require('graphql-tag/loader!./update-targets.gql');
const trargetByName = require('graphql-tag/loader!./target-by-name.gql');



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

  @Output() onCancel = new EventEmitter<boolean>();

  targets: ITargetNew[];
  valuePerc = true;
  item: IListItem;
  listLoad = false;
  tabIndex = 1;
  isCustom = false;
  private type: string;
  private identifier: string;
  private totalTabs = 3;



  constructor(public vm: FormTargetsViewModel,
    private _apolloService: ApolloService,
    private userService: UserService) {

  }

  ngOnInit(): void {
    const that = this;
    this.vm.initialize(null);
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
    this.vm.fg.controls['_id'].setValue('');
    this.vm.fg.controls['name'].setValue('');
    this.vm.fg.controls['type'].setValue('');
    this.vm.value = null;
    this.vm.fg.controls['compareTo'].setValue('');
    this.vm.fg.controls['recurrent'].setValue(false);
  }

  edit(id) {
    const target = filter( this.targets,  {'_id': id});
    this.vm.fg.controls['_id'].setValue(id);
    this.vm.fg.controls['name'].setValue(target[0].name);
    this.vm.fg.controls['unit'].setValue(target[0].unit);
    this.vm.fg.controls['type'].setValue(target[0].type);
    this.vm.fg.controls['value'].setValue(target[0].value);
    this.vm.fg.controls['compareTo'].setValue(target[0].compareTo);
    this.vm.fg.controls['recurrent'].setValue(target[0].recurrent);
  }


  selectItem(event) {
    this.vm.fg.controls._id.setValue(event.id);
    this.edit(event.id);
    this.milestoneComponent.refresh(event.id);
  }


  cancel() {
    this.onCancel.emit(true) ;
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
    this._refreshTargets();
  }

  private initialModel() {
    const that = this;
    this.vm.owner = this.userService.user._id;
    if (that.chart) {
      that.type = 'chart';
      that.identifier = that.chart._id;
      const frequency = that.chart.frequency;
      const predefined = that.chart.dateRange[0].predefined;

      if (predefined === 'custom') {
        that.isCustom = true;
      }

      that.vm.setTargetPeriod(frequency,  predefined);
      that.vm.source[0] =  {
        type: 'chart',
        identifier: that.chart._id
      };
      that.vm.kpi = that.chart.kpis[0]._id;
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
    const input = this.prepareModel();
    this._apolloService.mutation < ITargetNew > (editTargetsMutation, {'id': this.vm._id, 'TargetInput': input })
    .then(res => {
      this._refreshTargets(this.vm._id);
    })
    .catch(err => {
        this._displayServerErrors(err) ;
    });
  }

  private prepareModel() {
    let user = [];
    let index = 0;
    this.vm.users.forEach(element => {
      //corregir element.deliveryMethod 
      user[index++] = { id: element.id, deliveryMethod: [ 'mail' ]};
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
        'groupings': this.chart.groupings ,
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

}
