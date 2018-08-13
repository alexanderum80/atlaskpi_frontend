import { Component, Input, OnInit } from '@angular/core';

import { ITarget } from '../shared/models/targets.model';
import { FormTargetsViewModel } from './form-targets.viewmodel';

@Component({
  selector: 'kpi-form-targets',
  templateUrl: './form-targets.component.pug',
  styleUrls: ['./form-targets.component.scss'],
  providers: [FormTargetsViewModel]
})
export class FormTargetsComponent implements OnInit {
  @Input() model: ITarget;
  @Input() chart: any;

  tabIndex = 1;
  private totalTabs = 3;

  constructor(public vm: FormTargetsViewModel) {

  }

  ngOnInit(): void {
    this.vm.initialize(this.model);
    this.vm.fg.controls['name'].setValue('test');
  }

  update(model: ITarget): void {
    this.vm.update(model);
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

}
