import { CommonService } from '../../shared/services/common.service';
import { Router } from '@angular/router';
import { FormGroup } from '@angular/forms';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ModalComponent } from '../../ng-material-components';
import {
    Apollo
} from 'apollo-angular';
import SweetAlert from 'sweetalert2';
import {
  Subscription
} from 'rxjs/Subscription';


const callRailMutation = require('./call-rail.connect.gql');


interface CallRailMutationInput {
  accountId?: string;
  apiKey?: string;
}

@Component({
  selector: 'kpi-call-rail',
  templateUrl: './call-rail.component.pug',
  styleUrls: ['./call-rail.component.scss']
})
export class CallRailComponent implements OnInit, OnDestroy {
  @ViewChild('connectRails') modal: ModalComponent;

  callRailImagePath: string;
  apiKeyToolTip = true;
  accountIdToolTip = true;
  fg: FormGroup = new FormGroup({});
  formValues: CallRailMutationInput;

  private _subscription: Subscription[] = [];

  constructor(private _apollo: Apollo, private _router: Router) {
    this.callRailImagePath = '../../../assets/img/datasources/CallRail.DataSource.MainImage.png';
  }

  ngOnInit() {
    this._getFormValues();
  }

  ngOnDestroy() {
    CommonService.unsubscribe(this._subscription);
  }

  connect() {
    const that = this;
    this._canConnect();

    this._subscription.push(
      this._apollo.mutate({
        mutation: callRailMutation,
        variables: {
          input: that.formValues
        }
      }).subscribe(({ data }) => {
        if ((<any>data).callRailConnect.success) {
          that._router.navigateByUrl('/datasource/listConnectedDataSourcesComponent');
        } else {
          if ((<any>data).callRailConnect.errors) {
            const errors = (<any>data).callRailConnect.errors[0].errors[0];
            SweetAlert({
              title: 'CallRail Integration Error',
              type: 'error',
              text: errors
            });
          }
        }
      })
    );
    this.setApiKeyToolTip();
    this.setAccountIdToolTip();
  }

  cancel() {
    this.setApiKeyToolTip();
    this.setAccountIdToolTip();
    this.fg.reset();
    this.modal.close();
  }

  open() {
    this.modal.open();
  }

  // api keys tooltip
  openApiKeyToolTip(): void {
    this.apiKeyToolTip = !this.apiKeyToolTip;
  }

  closeApiKeyToolTip(item: boolean): void {
    this.apiKeyToolTip = item;
  }

  setApiKeyToolTip(): void {
    this.apiKeyToolTip = true;
  }

  // account id tooltip
  openAccountIdToolTip(): void {
    this.accountIdToolTip = !this.accountIdToolTip;
  }

  closeAccountIdToolTip(item: boolean): void {
    this.accountIdToolTip = item;
  }

  setAccountIdToolTip(): void {
    this.accountIdToolTip = true;
  }

  isFormValid() {
    return this.fg.valid &&
           this.fg.get('accountId').value.length === 9;
  }

  private _getFormValues() {
    const that = this;

    this._subscription.push(
      this.fg.valueChanges
        .debounceTime(100)
        .distinctUntilChanged()
        .subscribe(data => {
          if (!that.formValues) {
            that.formValues = {};
          }

          if (data.accountId) {
            that.formValues.accountId = data.accountId;
          }

          if (data.apiKey) {
            that.formValues.apiKey = data.apiKey;
          }
        })
    );
  }

  private _canConnect() {
    if (!this.formValues) { return false; }
    const keysLength = Object.keys(this.formValues).length;

    if (keysLength !== 2) {
      return false;
    }
    let flag = true;

    Object.keys(this.formValues).forEach(key => {
      if (!this.formValues[key]) {
        flag = false;
      }
    });

    return flag;
  }

}
