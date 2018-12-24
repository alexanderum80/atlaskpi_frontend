import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { IWidget } from '../shared/models';
import { Apollo } from 'apollo-angular';
import { widgetsGraphqlActions } from '../shared/graphql/widgets.graphql-actions';
import { ENGINE_METHOD_PKEY_ASN1_METHS } from 'constants';

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
  @Output() done = new EventEmitter<any>();

  widget: IWidget;
  loading = false;

  constructor(private _apollo: Apollo) { }

  ngOnInit() {
    if (this.autoRender) {
      this.previewWidget();
    }
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
