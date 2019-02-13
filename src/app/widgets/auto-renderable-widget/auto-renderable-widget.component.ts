import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { IWidget } from '../shared/models';
import { Apollo } from 'apollo-angular';
import { widgetsGraphqlActions } from '../shared/graphql/widgets.graphql-actions';
import { ENGINE_METHOD_PKEY_ASN1_METHS } from 'constants';
import { MenuItem } from 'src/app/dashboards/shared/models';
import { CloneWidgetActivity } from 'src/app/shared/authorization/activities/widgets/clone-widget.activity';
import { DeleteWidgetActivity } from 'src/app/shared/authorization/activities/widgets/delete-widget.activity';
import { UpdateWidgetActivity } from 'src/app/shared/authorization/activities/widgets/update-widget.activity';
import { WidgetViewViewModel } from 'src/app/widgets2/widget-view/widget-view.viewmodel';
import { UserService } from 'src/app/shared/services';

@Component({
  selector: 'kpi-auto-renderable-widget',
  templateUrl: './auto-renderable-widget.component.pug',
  styleUrls: ['./auto-renderable-widget.component.scss']
})
export class AutoRenderableWidgetComponent implements OnInit {
  @Input() item: IWidget;
  @Input() autoRender = true;
  @Input() placeholderImg;
  @Input() widgetPreview = false;
  @Input() showActions = false;

  @Input() descriptionOnlyAction = true;
  @Output() done = new EventEmitter<any>();

  widget: IWidget;
  loading = false;

  // widgetActionItems
  actionItems: MenuItem[] = [{
    id: '3',
    icon: 'more-vert',
    children: [
      {
        id: 'alert',
        icon: 'notifications',
        title: 'Alerts'
      },
      {
        id: 'edit',
        icon: 'edit',
        title: 'Edit'
      },
      {
        id: 'clone',
        icon: 'copy',
        title: 'Clone'
      },
      {
        id: 'delete',
        icon: 'delete',
        title: 'Delete'
      }
    ]
  }];

  constructor(
    private _apollo: Apollo,
    private _userService: UserService,
    public updateWidgetActivity: UpdateWidgetActivity,
    public deleteWidgetActivity: DeleteWidgetActivity,
    public cloneWidgetActivity: CloneWidgetActivity
  ) { }

  ngOnInit() {
    if (this.autoRender) {
      this.previewWidget();
    }

    // this.vm.addActivities(
    //   [this.updateWidgetActivity,
    //     this.deleteWidgetActivity,
    //     this.cloneWidgetActivity
    //   ]);
    this._disabledActionItem();
  }

  // find the object in the array of actionItems
  // set disabled to boolean value
  private _disabledActionItem(): void {
    if (this.actionItems && this.actionItems.length) {
      const itemAction = this.actionItems[0];
      if (itemAction.children) {
        itemAction.children.forEach(item => {
          if (item.id === 'edit') {
            item.disabled = this._editWidgetPermission();
          }
          if (item.id === 'delete') {
            item.disabled = this._deleteWidgetPermission();
          }
          if (item.id === 'clone') {
            item.disabled = this._cloneWidgetPermission();
          }
        });
      }
    }
  }

  // check if user have permission to edit widget
  private _editWidgetPermission() {
    return ! this.updateWidgetActivity.check( this._userService.user);
  }

  // check if user have permission to delete widget
  private _deleteWidgetPermission() {
    return ! this.deleteWidgetActivity.check( this._userService.user);
  }

  // check if user have permission to clone widget
  private _cloneWidgetPermission() {
    return !this.cloneWidgetActivity.check( this._userService.user);
  }


  previewWidget() {
    const that = this;
    this.loading = true;
    this._apollo.query<{ widget: IWidget }>({
      query: widgetsGraphqlActions.widgetQuery,
      variables: {
        id: that.item._id
      },
      fetchPolicy: 'network-only'
    })
      .toPromise()
      .then(res => {
        that.loading = false;
        that.widget = {
          _id: res.data.widget._id,
          order: res.data.widget.order,
          name: res.data.widget.name,
          description: res.data.widget.description || '',
          type: res.data.widget.type,
          size: res.data.widget.size,
          color: res.data.widget.color,
          fontColor: res.data.widget.fontColor,
          chartWidgetAttributes: res.data.widget.chartWidgetAttributes,
          numericWidgetAttributes: res.data.widget.numericWidgetAttributes,
          dashboards: res.data.widget.dashboards,
          hasAlerts: res.data.widget.hasAlerts,
          materialized: res.data.widget.materialized,
          preview: res.data.widget.preview,
          tags: res.data.widget.tags
        };
      });
  }

  onActionClicked(item) {
    const payload = {
      ...item,
      payload: this.item /*widget info*/
    }
    this.done.emit(payload);
  }

  get widgetBackgroundColor() {
    if (!this.item) { return '#fff'; }
    return this.item.type === 'chart' ? '#fff' : this.item.color;
  }

  get widgetFontColor() {
    if (!this.item) { return '#434348'; }
    return this.item.fontColor;
  }

  get placeholderVisible() {
    return !this.loading && !this.widget;
  }

  get previewButtonColor() {
    // if (this.item.color === '#fff' || this.item.color === 'white') {
    //   return 'green';
    // }
    return 'white';
  }

}
