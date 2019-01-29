import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { IRenderedFunnel } from '../shared/models/rendered-funnel.model';
import { Observable, throwError } from 'rxjs';
import { IFunnel } from '../shared/models/funnel.model';
import { ObservableInput } from 'rxjs/Observable';
import { ApolloQueryResult } from 'apollo-client';
import { objectWithoutProperties2 } from '../../shared/helpers/object.helpers';
import { filter, map, tap, catchError } from 'rxjs/operators';

const renderFunnelByIdQuery = require('graphql-tag/loader!./render-funnel-by-id.query.gql');

@Component({
  selector: 'app-show',
  templateUrl: './show-funnel.component.pug',
  styleUrls: ['./show-funnel.component.scss']
})
export class ShowFunnelComponent implements OnInit {

  subscriptions: Subscription[] = [];

  renderedFunnel$: Observable<IRenderedFunnel>;

  constructor(
    private _route: ActivatedRoute,
    private _apollo: Apollo
  ) { }

  ngOnInit() {
    this.renderedFunnel$ =
      this._route.params
        .switchMap((params: Params) => this.renderFunnelById(params['id']))
        .map(res => res.data.renderFunnelById);
  }

  private renderFunnelById(id: string):  ObservableInput < ApolloQueryResult < { renderFunnelById: IRenderedFunnel } >>  {
    return <any > this._apollo.query <IFunnel> ({
        query: renderFunnelByIdQuery,
        fetchPolicy: 'network-only',
        variables: { id }
    });
  }

}
