import { FormGroup, FormControl } from '@angular/forms';
import { GenericSelectionService } from './../../shared/services/generic-selection.service';
import { Subscription } from 'rxjs/Subscription';
import { Component, OnInit, Input, Output, EventEmitter, AfterViewInit } from '@angular/core';
import { IWidget } from '../shared/models';
import { Apollo } from 'apollo-angular';
import { widgetsGraphqlActions } from '../shared/graphql/widgets.graphql-actions';
import { ENGINE_METHOD_PKEY_ASN1_METHS } from 'constants';

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
  @Input() isFromDashboardEdit = false;
  @Output() done = new EventEmitter<any>();
  @Output() validPosition = new EventEmitter<boolean>(true);

  widget: IWidget;
  loading = false;
  widgetSelected = false;
  selectionSubscription: Subscription;
  fgWidget: FormGroup;

  constructor(private _apollo: Apollo,
              private _selectionService: GenericSelectionService) { }

  ngOnInit() {
    if (!this.isFromDashboardEdit) { return; }
    this.fgWidget = new FormGroup({
      'position': new FormControl(''),
    });
    if (this.autoRender) { this.previewWidget(); }
    this.selectionSubscription = this._selectionService.selection$.subscribe(selectedItems => {
      const exist = selectedItems.find(i => i.id === this.item._id);
      if (exist) {
        const fgValue = {
          position: exist.position
        };
        this.fgWidget.patchValue(fgValue);
        this.widgetSelected = true;
      } else {
        this.widgetSelected = false;
      }
   });
   this.fgWidget.valueChanges.subscribe(value => {
    if (isNaN(value.position)) {
      this.fgWidget.controls['position'].setErrors({invalidDataType: true});
      this.validPosition.emit(false);
      return;
    }
    // Here I must validate duplicated position value
    const duplicatedPos = this._selectionService._selectionList.find(s => s.type === 'widget'
    && s.position === parseInt(value.position, 0) && s.payload.size === this.item.size
    && s.id !== this.item._id);
    if (duplicatedPos) {
      this.fgWidget.controls['position'].setErrors({forbiddenName: true});
      this.validPosition.emit(false);
    } else {
      this.validPosition.emit(true);
      this.changePosition(value.position);
    }
   });
  }

  ngAfterViewInit() {
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

  changePosition(event) {
    const itemChange = { id: this.item._id, position: parseInt(event, 0) };
    this._selectionService.updateItemPosition(itemChange);
  }

  onClickPosition() {
    this._selectionService.allowDisableSelection = false;
  }

  onActionClicked($event) {
     this.done.emit($event);
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
    if (this.item.color === 'white') {
      return 'green';
    }
    return 'white';
  }

}
