import { Component, OnInit, Input } from '@angular/core';
import { FormTargetsViewModel } from './form-targets.viewmodel';
import { ITargets } from '../shared/models/targets.model';
import { SelectionItem } from '../../ng-material-components';

@Component({
  selector: 'kpi-form-targets',
  templateUrl: './form-targets.component.pug',
  styleUrls: ['./form-targets.component.scss'],
  providers: [FormTargetsViewModel]
})
export class FormTargetsComponent implements OnInit {
  @Input() model: ITargets;
  @Input() chart: any;
  
  basic: boolean = true;
  milestone: boolean = false;
  relatedUsers: boolean = false;
 
  constructor(public vm: FormTargetsViewModel) {

  }

  ngOnInit(): void {
      this.vm.initialize(this.model);
      this.vm.fg.controls['name'].setValue('test');
  }

  update(model: ITargets): void {
      this.vm.update(model);
  }

  toggleActive() {
  }

  switchTab(tab: any) {
    switch(tab) {
      case 'relatedUsers':
        this.relatedUsers = true;
        this.basic = false;
        this.milestone = false;
        break;
      case 'milestone':
        this.relatedUsers = false;
        this.basic = false;
        this.milestone = true;
        break;
      case 'basic':
        this.relatedUsers = false;
        this.basic = true;
        this.milestone = false;
        break;
    }
  } 

  moveTab(action: string) {
    action === 'next' ?  this.actionNext() :  this.actionBack() ;  
  }

  private actionNext() {
    this.basic ? this.relatedUsers = true : this.milestone = true;
  }

  private actionBack() {
    this.milestone ? this.relatedUsers = true: this.basic = true;
  }


}
