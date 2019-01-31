import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { ApolloService } from '../../shared/services/apollo.service';
import { Subscription } from 'rxjs/Subscription';
import { CommonService } from '../../shared/services';
import { IFunnel } from '../shared/models/funnel.model';
import { Apollo } from 'apollo-angular';
import { objectWithoutProperties, objectWithoutProperties2 } from '../../shared/helpers/object.helpers';

import { combineLatest, Observable, throwError } from 'rxjs';
import { FunnelService } from '../shared/services/funnel.service';
import { IUserInfo, IMutationResponse } from '../../shared/models';
import { IRenderedFunnel } from '../shared/models/rendered-funnel.model';
import { ObservableInput } from 'rxjs/Observable';
import { ApolloQueryResult } from 'apollo-client';
import { filter, map, tap, catchError } from 'rxjs/operators';

const funnelByIdQuery = require('graphql-tag/loader!./funnel-by-id.query.gql');
const updateFunnelMutation = require('graphql-tag/loader!./update-funnel.mutation.gql');

@Component({
  selector: 'app-edit-funnel',
  templateUrl: './edit-funnel.component.pug',
  styleUrls: ['./edit-funnel.component.scss']
})
export class EditFunnelComponent implements OnInit, OnDestroy {
  subscriptions: Subscription[] = [];


  funnelModel: IFunnel = {
    name: '',
    stages: [ ]
  };

  ready$: Observable<boolean>;
  renderedFunnel$: Observable<IRenderedFunnel>;
  currentUser: IUserInfo;

  funnelId: string;

  constructor(
    private funnelService: FunnelService,
    private _route: ActivatedRoute,
    private _router: Router,
    private _apollo: Apollo
  ) { }

  ngOnInit() {

    this.ready$ = combineLatest(
        this.funnelService.loadFormDependencies$(),
        this._route.params
          .do((params: Params) => this.funnelId = params['id'])
          .switchMap((params: Params) => this._getFunnelById(params['id']))
    ).pipe(
        tap(([v, res])  => {
          this.funnelModel = (<any>objectWithoutProperties2(res.data.funnelById, ['__typename']));
          // this.funnelModel = res.data.funnelById;

          this.funnelService.funnelModel = this.funnelModel;
        }),
        catchError(error => {
          console.log(error);
          return throwError(error);
        }),
        map(v => true)
    );

    this.renderedFunnel$ = this.funnelService.renderedFunnelModel$;

    let id;
    this.subscriptions.push(this._route.params.subscribe(params => {
       id = params['id'];
       this._getFunnelById(id);
    }));
  }


  ngOnDestroy() {
      CommonService.unsubscribe(this.subscriptions);
  }

  private _getFunnelById(id: string): ObservableInput < ApolloQueryResult < { funnelById: IFunnel } >> {
    return <any > this._apollo.query < IFunnel > ({
        query: funnelByIdQuery,
        fetchPolicy: 'network-only',
        variables: { id }
    });
}

  async updateFunnel() {
    const input = this.funnelService.getFormData();

    try {
        const res = await this._apollo.mutate<{ update: IMutationResponse}>({
            mutation: updateFunnelMutation,
            variables:  { input, _id: input._id }
        }).toPromise();

        if (res.data && res.data.updateFunnel.entity) {
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
