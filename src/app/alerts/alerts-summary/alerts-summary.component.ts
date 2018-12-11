import SweetAlert from 'sweetalert2';
import { IAlerts } from './../alerts.model';
import { Component, OnInit, Input, Output, EventEmitter, AfterViewInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { AlertsFormService } from '../alerts.service';
import { ApolloService } from 'src/app/shared/services/apollo.service';
import { Router } from '@angular/router';

const deleteAlertMutation = require('graphql-tag/loader!../remove-alert.mutation.gql');

@Component({
  selector: 'kpi-alerts-summary',
  templateUrl: './alerts-summary.component.pug',
  styleUrls: ['./alerts-summary.component.scss']
})
export class AlertsSummaryComponent implements OnInit, AfterViewInit {
  @Input() alert: IAlerts;
  @Input() index = 0;
  @Output() selectedAlertIndex = new EventEmitter<number>();
  @Output() switchedActive = new EventEmitter<boolean>();

  constructor(
    public vm: AlertsFormService,
    private _apolloService: ApolloService,
    private _router: Router
  ) { }

  fg: FormGroup = new FormGroup({});

  selectedAlertSaved = true;

  ngOnInit() {
    this._subscribeToFormChange();
  }

  ngAfterViewInit() {
    const fgValue = {
      active: this.alert.active
    };
    this.fg.patchValue(fgValue);
  }

  updateSelectedAlert(alertIndex) {
    this.selectedAlertIndex.emit(alertIndex);
  }

  get canRemove() {
    return (this.vm.deleteAlertPermission() && this.alert._id);
  }

  get isSystemAlert() {
    return this.alert.name === this.vm.systemAlert.name;
  }

  removeAlert(alertId) {
    if(!alertId) return;

    if (!this.vm.deleteAlertPermission()) {
      this._router.navigateByUrl('/unauthorized');
    } else {
      SweetAlert({
        type: 'warning',
        title: 'Are you sure?',
        text: 'Once deleted, you will not be able to recover this alert',
        showConfirmButton: true,
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'Cancel',
      }).then(result => {
        if (result.value === true) {
          this._apolloService.mutation<any> (deleteAlertMutation, { id: alertId }, ['Alerts'])
            .then(res => {
              if (res.data.removeAlert.success) {
                this.selectedAlertIndex.emit(0);
                this.vm.removeAlert(alertId);
              }
            });
        }
      });
    }
  }

  get userAlertDescription() {
    const description = this.alert.frequency && this.alert.frequency !== '' ?
            this.alert.frequency.toUpperCase() :
            'User alert';
    return description;
  }

  private _subscribeToFormChange() {
    this.fg.valueChanges.subscribe(fg => {
      if (fg.active !== undefined && fg.active !== '') {
        this.switchedActive.emit(fg.active);
      }
    });
  }

}
