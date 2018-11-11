import { WindowService } from '../../shared/services';
import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { ApolloQueryResult } from 'apollo-client/core/types';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import Sweetalert from 'sweetalert2';
import * as moment from 'moment';

import { CloneWidgetActivity } from '../../shared/authorization/activities/widgets/clone-widget.activity';
import { Activity } from '../../shared/authorization/decorators/component-activity.decorator';
import { IMutationResponse } from '../../shared/models';
import { DialogResult } from '../../shared/models/dialog-result';
import { ApolloService } from '../../shared/services/apollo.service';
import { CommonService } from '../../shared/services/common.service';
import { IWidget } from '../shared/models';
import { widgetsGraphqlActions } from '../shared/graphql/widgets.graphql-actions';
import { WidgetsFormService } from '../widget-form/widgets-form.service';

const getWidgetByTitle = require('graphql-tag/loader!../shared/graphql/get-widget-by-name.gql');

@Activity(CloneWidgetActivity)
@Component({
  selector: 'kpi-clone-widget',
  templateUrl: './clone-widget.component.pug',
  styleUrls: ['./clone-widget.component.scss'],
  providers: [WidgetsFormService]
})
export class CloneWidgetComponent implements OnInit, AfterViewInit, OnDestroy {
  fg: FormGroup = new FormGroup({});
  widgetId: string;
  loading = true;

  private _subscription: Subscription[] = [];

  constructor(private _widgetFormService: WidgetsFormService,
              private _apolloService: ApolloService,
              private _apollo: Apollo,
              private _router: Router,
              private fb: FormBuilder,
              private _route: ActivatedRoute,
              private windowService: WindowService) { }

  ngOnInit() {
    const that = this;
    this._subscription.push(
      this._route.params
        .do((params: Params) => that.widgetId = params['id'])
        .switchMap((params: Params) => that._getWidgetByIdQuery(params['id']))
        .subscribe(response => {
          const data: IWidget = Object.assign({ preview: true}, response.data.widget);
          data.name += ` (copy ${moment().format('H:mm:ss')})`;
          that._widgetFormService.loadModel(data);
          that.loading = false;
        })
    );
  }

  ngOnDestroy() {
    CommonService.unsubscribe(this._subscription);
  }
  
   ngAfterViewInit() {
  }

  onWidgetFormEvent($event: DialogResult) {
    switch ($event) {
      case DialogResult.SAVE:
          this.cloneWidget();
          break;

      case DialogResult.CANCEL:
          this.windowService.nativeWindow.history.back();
          break;
    }
  }

  cloneWidget() {
  
    const that = this;

    const payload = this._widgetFormService.getWidgetPayload();

    this._widgetFormService.updateExistDuplicatedName(false);

    this._apolloService.networkQuery < IWidget > (getWidgetByTitle, { name: payload.name }).then(d => {
      if (d.widgetByName) {
        this._widgetFormService.updateExistDuplicatedName(true);

        this.fg.controls['name'].setErrors({forbiddenName: true});

        return Sweetalert({
              title: 'Duplicated name!',
              text: 'You already have a Widget with that name. Please change the name and try again.',
              type: 'error',
              showConfirmButton: true,
              confirmButtonText: 'Ok'
            });
      }

      this._subscription.push(this._apollo.mutate<{ createWidget: IMutationResponse }>({
            mutation: widgetsGraphqlActions.createWidget,
            variables: { input: payload }
          })
          .subscribe(response => {
              if (response.data.createWidget.entity) {
                this.windowService.nativeWindow.history.back();
              }

              if (response.data.createWidget.errors) {
                  // perform an error message
                  alert(JSON.stringify(response.data.createWidget.errors));
              }
          }));
        });
  }  

  private _getWidgetByIdQuery(id: string): Observable<ApolloQueryResult<{ widget: IWidget}>> {
    return this._apollo.watchQuery<{ widget: IWidget }>({
        query: widgetsGraphqlActions.widgetQuery,
        variables: {
          id: id
        },
        fetchPolicy: 'network-only'
      }).valueChanges;
  }

}
