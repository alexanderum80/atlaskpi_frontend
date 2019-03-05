import { FormGroup, FormControl } from '@angular/forms';
import { GenericSelectionService } from './../../shared/services/generic-selection.service';
import { Subscription } from 'rxjs/Subscription';
import { Component, OnInit, Input, Output, EventEmitter, AfterViewInit } from '@angular/core';
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
  styleUrls: ['./auto-renderable-widget.component.scss'],
})
export class AutoRenderableWidgetComponent implements OnInit, AfterViewInit {
  @Input() item: IWidget;
  @Input() autoRender = true;
  @Input() placeholderImg;
  @Input() widgetPreview = false;
  @Input() showActions = false;

  @Input() descriptionOnlyAction = true;
  @Input() isFromDashboardEdit = false;
  @Output() done = new EventEmitter<any>();

  widget: IWidget;
  loading = false;
  widgetSelected = false;
  selectionSubscription: Subscription;
  fgWidget: FormGroup;
  fgPatched = false;

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
    private _selectionService: GenericSelectionService,
    public updateWidgetActivity: UpdateWidgetActivity,
    public deleteWidgetActivity: DeleteWidgetActivity,
    public cloneWidgetActivity: CloneWidgetActivity
  ) { }
  
  
  ngOnInit() {
    if (this.autoRender) { this.previewWidget(); }
    
    this._disabledActionItem();
    
    if (!this.isFromDashboardEdit) { return; }
    this.fgWidget = new FormGroup({
      'position': new FormControl(''),
    });
    
    this.selectionSubscription = this._selectionService.selection$.subscribe(selectedItems => {
      const exist = selectedItems.find(i => i.id === this.item._id);
      if (exist) {
        const fgValue = {
          position: exist.position
        };
        if (!this.fgPatched) {
          this.fgWidget.patchValue(fgValue);
          this.fgPatched = true;
        }
        this.widgetSelected = true;
        if (exist.position === 0) {
          this.fgWidget.controls['position'].setErrors({invalidDataType: true});
        } else {
          if (!exist.validPosition) {
            this.fgWidget.controls['position'].setErrors({forbiddenName: true});
          } else {
            this.fgWidget.controls['position'].setErrors(null);
          }
        }
      } else {
        this.widgetSelected = false;
        this.fgPatched = false;
      }
   });
   this.fgWidget.valueChanges.subscribe(value => {
    if (isNaN(value.position) || value.position === '') {
      this.changePosition(0);
    } else {
      if (this.fgPatched) {
        this.changePosition(value.position);
      } else {
        this.fgPatched = true;
      }
    }
  });
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

  ngAfterViewInit() {
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
  changePosition(event) {
    const itemChange = { id: this.item._id, type: 'widget', size: this.item.size , position: parseInt(event, 0) };
    this._selectionService.updateItemPosition(itemChange);
  }

  onClickPosition() {
    this._selectionService.allowDisableSelection = false;
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
