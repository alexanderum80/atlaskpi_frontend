import { WidgetAlertComponent } from '../widget-alert/widget-alert.component';
import { CommonService } from '../../shared/services/common.service';
import { ViewWidgetActivity } from '../../shared/authorization/activities/widgets/view-widget.activity';
import { Activity } from '../../shared/authorization/decorators/component-activity.decorator';
import { AddWidgetActivity } from '../../shared/authorization/activities/widgets/add-widget.activity';
import { ListWidgetsViewModel } from './list-widgets.viewmodel';
import { ItemAction } from './../../shared/models/item-action';
import { Subscription } from 'rxjs/Subscription';
import { IMutationResponse } from './../../shared/models/mutation-response';
import { IWidget, WidgetSizeEnum, WidgetSizeMap } from './../shared/models/widget.models';
import { widgetsGraphqlActions } from '../shared/graphql/widgets.graphql-actions';
import { Apollo } from 'apollo-angular';
import { Router } from '@angular/router';
import { ModalComponent } from '../../ng-material-components';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { IModalError } from '../../shared/interfaces/modal-error.interface';

@Activity(ViewWidgetActivity)
@Component({
  selector: 'kpi-list-widgets',
  templateUrl: './list-widgets.component.pug',
  styleUrls: ['./list-widgets.component.scss'],
  providers: [ListWidgetsViewModel, AddWidgetActivity]
})
export class ListWidgetsComponent implements OnInit, OnDestroy {
  @ViewChild('removeConfirmationModal') removeWidgetModal: ModalComponent;
  @ViewChild('errorModal') errorModal: ModalComponent;
  @ViewChild('widgetAlert') widgetAlert: WidgetAlertComponent;

  selectedWidgetId: string;

  widgetsCollection: IWidget[] = [];
  bigWidgets: IWidget[] = [];
  smallWidgets: IWidget[] = [];

  listWidgetsSubscription: Subscription[] = [];
  loading = true;

  lastError: IModalError;

  constructor(private _router: Router,
              private _apollo: Apollo,
              public vm: ListWidgetsViewModel,
              public addWidgetActivity: AddWidgetActivity) { }

  ngOnInit() {
    const that = this;
    this.vm.addActivities([this.addWidgetActivity]);

    this.listWidgetsSubscription.push(this._apollo.watchQuery<{listWidgets: IWidget[]}>({
      query: widgetsGraphqlActions.listWidgetsNoData,
      variables: { materialize: false },
      fetchPolicy: 'network-only'
    })
    .valueChanges.subscribe(res => {
      that.widgetsCollection = res.data.listWidgets || [];

      if (that.widgetsCollection.length > 0) {
        that.bigWidgets = that.widgetsCollection.filter(w => WidgetSizeMap[w.size] === WidgetSizeEnum.Big);
        that.smallWidgets = that.widgetsCollection.filter(w => WidgetSizeMap[w.size] === WidgetSizeEnum.Small);
      }

      that.loading = false;
    }));
  }

  ngOnDestroy() {
    CommonService.unsubscribe(this.listWidgetsSubscription);
  }

  getSizeClasses(widget) {
    return widget.size === 'big' ?
        'flex-xs-100 flex-gt-sm-30 flex-gt-lg-20'
        : 'flex-xs-50 flex-gt-sm-15 flex-gt-lg-10';
  }

  addWidget(): void {
    this._router.navigateByUrl('/widgets/new');
  }

  onActionClicked(item) {
    switch (item.id) {
      case 'edit':
        this._router.navigateByUrl(`/widgets/edit/${item.payload.id}`);
        break;
      case 'alert':
        this.widgetAlert.open(item.widget);
        break;
      case 'delete':
        this.removeWidget(item.payload.id);
        break;
    }
  }

  // region modal methods

  removeWidget(id: string): void {
    this.selectedWidgetId = id;
    this.removeWidgetModal.open();
  }

  confirmRemove(): void {
    const that = this;

    this._apollo.mutate<{removeWidget: IMutationResponse}>({
      mutation: widgetsGraphqlActions.removeWidget,
      variables: { id: that.selectedWidgetId },
      refetchQueries: ['WidgetList']
    })
    .subscribe(res => {
      if (res.data.removeWidget.success) {
        this.removeWidgetModal.close();
        const widgetId = res.data.removeWidget.entity._id;
        that.smallWidgets = that.smallWidgets.filter(widget => widget._id !== widgetId);
        that.bigWidgets = that.bigWidgets.filter(widget => widget._id !== widgetId);
        return;
      }

      if (res.data.removeWidget.errors) {
        const errors = res.data.removeWidget.errors;
        const dependency = errors.find(e => e.field === '__isDependencyOf');

        if (dependency) {
          that.removeWidgetModal.close();
          that.lastError = {
            title: 'Error removing widget',
            msg: 'A widget cannot be remove while it\'s being used. The following element(s) are currently using this widget: ',
            items: dependency.errors
          };
        } else {
          that.lastError = {
            title: 'Error removing widget',
            msg: 'An unhandled error occured, contact support: ',
            items: [JSON.stringify(errors)]
          };
        }

        that.errorModal.open();
      }
    });
 }

  cancelRemove(): void {
    this.removeWidgetModal.close();
  }


  // endregion

  // region properties

  get bigWidgetsCollectionEmpty(): boolean {
    return this.bigWidgets.length === 0;
  }

  get smallWidgetsCollectionEmpty(): boolean {
    return this.smallWidgets.length === 0;
  }

  get ngIfAddItem(): number {
    return this.bigWidgets.length || this.smallWidgets.length;
  }

  // endregion

}
