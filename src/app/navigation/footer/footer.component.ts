import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';

@Component({
  selector: 'kpi-footer',
  templateUrl: './footer.component.pug',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  year: number;
  
  constructor() { 
    this.year = moment().year();
  }

  ngOnInit() {
  }


}
