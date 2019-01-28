import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'kpi-data-entry',
  template: '<div style="padding: 10px; height: 95%;"><router-outlet></router-outlet></div>'
})
export class DataEntryComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
