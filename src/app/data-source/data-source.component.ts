import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup } from '@angular/forms';
import { Apollo } from 'apollo-angular';
import { DataSourceService } from "./shared/services/data-source.service/data-source.service";

@Component({
  selector: 'kpi-data-source',
  template: '<router-outlet></router-outlet>',
})

export class DataSourceComponent { }
