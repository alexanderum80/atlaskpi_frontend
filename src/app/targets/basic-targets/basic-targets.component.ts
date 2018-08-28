import { Component, OnInit, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import {
  Subscription
} from 'rxjs/Subscription';

@Component({
  selector: 'kpi-basic-targets',
  templateUrl: './basic-targets.component.pug',
  styleUrls: ['./basic-targets.component.scss']
})
export class BasicTargetsComponent implements OnInit {
  @Input() fg: FormGroup;
  @Input() vm: any;

  colorValue = 'white';
  colorPercent = 'white';
  valuePerc = true;
  private _subscription: Subscription[] = [];


  constructor() { }

  ngOnInit() {
    this.subscription();
  }

  unit(unit: string) {
    this.fg.controls.unit.setValue(unit);
  }

  private subscription() {
    const that = this;
      that._subscription.push(this.vm.fg.controls['type'].valueChanges.subscribe(value => {
        that._valuePerc(value);
    }));
  }

  private _valuePerc(type) {
    if (type === 'fixed')  {
      this.valuePerc = false;
      this.colorPercent = 'white';
      this.colorValue = 'silver';
      this.fg.controls.unit.setValue('value');
    } else {
      this.valuePerc = true;
      this.colorPercent = 'silver';
      this.colorValue = 'white';
      this.fg.controls.unit.setValue('percent');
    }
  }


}
