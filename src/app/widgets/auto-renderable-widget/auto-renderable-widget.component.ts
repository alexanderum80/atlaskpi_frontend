import { Component, OnInit, Input } from '@angular/core';
import { IWidget } from '../shared/models/index';
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
      that.widget = res.data.widget;
    });
  }

  get widgetBackgroundColor() {
    if (!this.item || this.item.type === 'chart') {
        return 'white';
    }
    return this.item.color;
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
