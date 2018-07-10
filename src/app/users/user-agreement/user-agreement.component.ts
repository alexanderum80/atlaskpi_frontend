import { CommonService } from '../../shared/services/index';
import {
  Component,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter,
  Input
} from '@angular/core';
import {Apollo} from 'apollo-angular';
import SweetAlert from 'sweetalert2';
import { UserAgreementService } from './user-agreement.service';
import { Subscription } from 'rxjs/Subscription';

const updateUserAgreementGql = require('graphql-tag/loader!./update-user-agreement.mutation.gql');

export enum EmunUserTerms {
  AGREE = 'agree',
  DECLINE = 'decline'
}

@Component({
  selector: 'kpi-user-agreement',
  templateUrl: './user-agreement.component.pug',
  styleUrls: ['./user-agreement.component.scss'],
  providers: [UserAgreementService]
})
export class UserAgreementComponent implements OnInit, OnDestroy {
  @Input() username: string;
  @Output() done = new EventEmitter<boolean>();

  private _subscription: Subscription[] = [];

  constructor(
    private _apollo: Apollo,
    private _userAgreeService: UserAgreementService) { }

  ngOnInit() {
  }

  ngOnDestroy() {
    CommonService.unsubscribe(this._subscription);
  }

  clickAction(action: string): void {
    if (!action) { return; }
    const that = this;

    switch (action) {
      case EmunUserTerms.AGREE:
          that._updateUserAgreementMutation(true);
        break;
      case EmunUserTerms.DECLINE:
        SweetAlert({
                title: 'User Agreement Info',
                text: `Note that failing to agree to our user's agreement will result on the account being suspended immediately.
                       Do you still want to decline?`,
                type: 'info',
                confirmButtonText: 'Yes, decline',
                showCancelButton: true,
                cancelButtonText: 'No, go back'
            })
            .then((res) => {
              const decline = false;

              if (res.value === true) {
                that._updateUserAgreementMutation(decline);
                return;
              }
            });
        break;
    }

  }

  private _updateUserAgreementMutation(accept: boolean): void {
    const that = this;

    this._subscription.push(that._apollo.mutate({
      mutation: updateUserAgreementGql,
      variables: {
          input: {
            email: that.username,
            accept: accept
          }
      }
    })
    .subscribe(({ data }) => {
      that.done.emit(accept);
    }));
  }

}
