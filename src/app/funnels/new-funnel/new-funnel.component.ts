import { Component, OnInit } from '@angular/core';

import { Observable } from 'rxjs';
import { FunnelService } from '../shared/services/funnel.service';
import { IFunnel } from '../shared/models/funnel.model';
import { IRenderedFunnel } from '../shared/models/rendered-funnel.model';
import { cloneDeep } from '../../../../node_modules/apollo-utilities';
import { IKpiDateRangePickerDateRange } from '../shared/models/models';
import * as moment from 'moment';
import { AKPIDateFormatEnum, IUserInfo, IMutationResponse } from '../../shared/models';
import { Apollo } from 'apollo-angular';
import { UserService } from '../../shared/services';
import { Router } from '@angular/router';


const createFunnelMutation = require('graphql-tag/loader!./create-funnel.mutation.gql');

@Component({
  selector: 'kpi-new-funnel',
  templateUrl: './new-funnel.component.pug',
  styleUrls: ['./new-funnel.component.scss']
})
export class NewFunnelComponent implements OnInit {
  funnelModel: IFunnel = {
      name: '',
      stages: [ ]
  };

  ready$: Observable<boolean>;

  renderedFunnel$: Observable<IRenderedFunnel>;
  formValid$: Observable<boolean>;
  currentUser: IUserInfo;

  constructor(
      private funnelService: FunnelService,
      private apollo: Apollo,
      private _userService: UserService,
      private _router: Router,
  ) {
    this.currentUser = this._userService.user;
  }


  ngOnInit() {
      this.ready$ = this.funnelService.loadFormDependencies$();
      this.funnelService.funnelModel = this.funnelModel;
      this.renderedFunnel$ = this.funnelService.renderedFunnelModel$;
  }

  async saveFunnel() {
        const input = this.funnelService.getFormData();

        delete(input._id);

        try {
            const res = await this.apollo.mutate<{ createFunnel: IMutationResponse}>({
                mutation: createFunnelMutation,
                variables:  { input }
            }).toPromise();

            if (res.data && res.data.createFunnel.entity) {
                this._router.navigateByUrl('/funnels/list');
            }

        } catch (err) {
            console.log(err);
        }
  }

  cancel() {
    this._router.navigateByUrl('/funnels/list');
  }

  get formValid() {
      return this.funnelService.formValid;
  }

}
