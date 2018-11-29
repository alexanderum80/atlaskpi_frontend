import { IKPI } from './../../shared/domain/kpis/kpi';
import { IAlerts } from './../alerts.model';
import { FormGroup, FormArray } from '@angular/forms';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AlertsFormService } from '../alerts.service';
import { ApolloService } from 'src/app/shared/services/apollo.service';

const kpisQuery = require('graphql-tag/loader!../../kpis/list-kpis/kpis.gql');

@Component({
  selector: 'kpi-alerts-details',
  templateUrl: './alerts-details.component.pug',
  styleUrls: ['./alerts-details.component.scss'],
  providers: [ AlertsFormService ]
})
export class AlertsDetailsComponent implements OnInit {
  @Input() fg: FormGroup;
  @Input() alert: IAlerts;
  @Input() isMobile: boolean;
  @Output() goBackToList = new EventEmitter();

  alertTitle: string;

  constructor(
    public alertsService: AlertsFormService,
    private _apolloService: ApolloService
  ) {}

  ngOnInit() {
    this._getKPIS();
  }

  private async _getKPIS() {
    await this._apolloService.networkQuery < IKPI[] > (kpisQuery).then(data => {
      const kpisCollection = data.kpis.map(kpi => {
        return {
          id: kpi._id,
          title: kpi.name,
          seleted: false
        };
      });

      this.alertsService.updateKpiList(kpisCollection);
    });
  }

  isUserAlert() {
    if (!this.alert) { return true; }
    const userAlert = this.alert.name !== 'First Sale of day';
    if (userAlert) {
      this.alertTitle = 'Create your own custom alerts';
    } else {
      this.alertTitle = 'Select a kpi for this alert';
    }
    return userAlert;
  }

  backToList() {
    this.goBackToList.emit();
  }

}
