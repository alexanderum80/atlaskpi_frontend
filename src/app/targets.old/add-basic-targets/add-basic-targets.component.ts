import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import {
  Subscription
} from 'rxjs/Subscription';

@Component({
  selector: 'kpi-add-basic-targets',
  templateUrl: './add-basic-targets.component.pug',
  styleUrls: ['./add-basic-targets.component.scss']
})
export class AddBasicTargetsComponent implements OnInit {
  @Input() fg: FormGroup;
  @Input() vm: any;
  @Input() isBaseOnVisible = true;

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
    unit === 'value' ? this.valuePerc = false : this.valuePerc = true;
    this._color();
  }

  private subscription() {
    const that = this;
      that._subscription.push(this.vm.fg.controls['type'].valueChanges.subscribe(value => {
        that._valuePerc(value);
    }));

  }

  private _color() {
    if (this.valuePerc) {
      this.colorPercent = 'blue';
      this.colorValue = 'white';
    } else {
      this.colorPercent = 'white';
      this.colorValue = 'blue';
    }
  }

  private _valuePerc(type) {
    if (type === 'fixed')  {
      this.isBaseOnVisible = false;
      this.valuePerc = false;
      this.fg.controls.unit.setValue('value');
    } else {
      this.isBaseOnVisible = true;
      this.valuePerc = true;
      this.fg.controls.unit.setValue('percent');
    }
    this._color();
  }


}
