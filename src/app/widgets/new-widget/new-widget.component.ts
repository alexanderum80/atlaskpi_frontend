import { CommonService } from '../../shared/services/common.service';
import { AddWidgetActivity } from '../../shared/authorization/activities/widgets/add-widget.activity';
import { Activity } from '../../shared/authorization/decorators/component-activity.decorator';
import { DialogResult } from '../../shared/models/dialog-result';
import { Router } from '@angular/router';
import { widgetsGraphqlActions } from '../shared/graphql/widgets.graphql-actions';
import { IMutationResponse } from '../../shared/models/mutation-response';
import { WidgetsFormService } from '../widget-form/widgets-form.service';
import { Apollo } from 'apollo-angular';
import { WidgetFormComponent } from '../widget-form/widget-form.component';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { IWidget } from '../shared/models';
import { ApolloService } from '../../shared/services/apollo.service';
import Sweetalert from 'sweetalert2';
import { Subscription } from 'rxjs/Subscription';
import { Input, Output, EventEmitter } from '@angular/core';

const getWidgetByTitle = require('graphql-tag/loader!../shared/graphql/get-widget-by-name.gql');

@Activity(AddWidgetActivity)
@Component({
  selector: 'kpi-new-widget',
  templateUrl: './new-widget.component.pug',
  styleUrls: ['./new-widget.component.scss'],
  providers: [WidgetsFormService]
})

export class NewWidgetComponent implements OnInit, OnDestroy {
  @Input() isFromDashboard = false;
  @Input() widgetDataFromKPI : any;
  @Output() result = new EventEmitter();
  fg: FormGroup = new FormGroup({});

  private _subscription: Subscription[] = [];

  constructor(private _widgetFormService: WidgetsFormService,
              private _apolloService: ApolloService,
              private _apollo: Apollo,
              private fb: FormBuilder,
              private _router: Router) { }

  ngOnInit() {
    this._widgetFormService.newModel();

    this._widgetFormService.updateExistDuplicatedName(false);

  }

  ngOnDestroy() {
    CommonService.unsubscribe(this._subscription);
  }

  onWidgetFormEvent($event: DialogResult) {
    switch ($event) {
      case DialogResult.SAVE:
          this.saveWidget();
          break;
      case DialogResult.CANCEL:
          this.exitNewWidget();
          break;
    }
  }

  private exitNewWidget() {
    if (this.isFromDashboard) {
        this.result.emit('widgets');
    } else {
        if (this.widgetDataFromKPI) {
          this._router.navigateByUrl('/kpis/list');
        } else {
          this._router.navigateByUrl('/widgets');
        }
    }    
  }

  saveWidget() {
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
                  this.exitNewWidget();
              }

              if (response.data.createWidget.errors) {
                  // perform an error message
                  alert(JSON.stringify(response.data.createWidget.errors));
              }
          }));
        });
  }
}
