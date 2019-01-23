import { isEmpty } from 'lodash';
import { ShowMapFormViewModel } from './show-map-form.viewmodel';
import {
  Component,
  ElementRef,
  OnInit,
  Renderer,
  ViewChild,
  AfterViewInit,
  Input
} from '@angular/core';
import {ApolloService} from '../../shared/services/apollo.service';
import { IDataSource } from '../../shared/domain/kpis/data-source';
import { SelectionItem } from '../../ng-material-components';
import { Subscription } from 'rxjs';

const fieldsWithData = require('graphql-tag/loader!./fields-with-data.gql');
const kpiGroupingsQuery = require('graphql-tag/loader!../../charts/shared/ui/chart-basic-info/kpi-groupings.query.gql');

@Component({
  selector: 'kpi-show-map-form',
  templateUrl: './show-map-form.component.pug',
  styleUrls: ['./show-map-form.component.scss'],
  providers: [ShowMapFormViewModel]
})
export class ShowMapFormComponent implements OnInit, AfterViewInit {
  loading: ElementRef;
  @Input() kpi: string;
  // @ViewChild('loading') loading: ElementRef;
  @ViewChild('loading') set loadingElementRef(content: ElementRef) {
    if (content) {
      this.loading = content;
    }
  }

  isLoading = true;
  groupingList: SelectionItem[] = [];
  subscriptions: Subscription[] = [];

  constructor(
      public vm: ShowMapFormViewModel,
      private _apolloService: ApolloService,
      private _renderer: Renderer) {
    this.vm.initialize(null);
  }

  ngOnInit() {
    this._getDataSources();
    this.subscriptions.push(
      this.vm.fg.controls['dateRange'].valueChanges.subscribe(fgValues => {
        this._getGroupingInfo(fgValues);
      })
  );
  }

  ngAfterViewInit() {
    this.loadingMessage();
  }

  loadingMessage(): void {
    let loadingInterval;

    if (this.isLoading && this.loading) {
      let text = '';
      const that = this;

      loadingInterval = setInterval(() => {
        text += '.';
        if (text.length === 6) {
          text = '';
        }

        that._renderer.setElementProperty(
          that.loading.nativeElement,
          'innerHTML',
          `Loading Groupings ${text}`
        );
      }, 200);

    } else {
      clearInterval(loadingInterval);
    }
  }

  private _getDataSources() {
    const that = this;

    this._apolloService.networkQuery<{ dataSources: IDataSource[] }>(
        fieldsWithData,
        { source: 'sales' }
    )
        .then(res => {
            that.isLoading = false;
            that.vm.updateAvailableGroupings(res.fieldsWithData);
        });
  }

  private _getGroupingInfo(dateRange: any): void {
    const that = this;

    if (!dateRange) { return; }

    const dateRangeInput = [{
      predefined: dateRange,
      custom: {
        from: null,
        to: null
      }
    }];
    const input = {
      ids: [this.kpi],
      dateRange: dateRangeInput
    };

    this._apolloService.networkQuery(kpiGroupingsQuery, { input })
        .then(data => {
            if (data || !isEmpty(data.kpiGroupings)) {
              that.vm.groupingItems = data.kpiGroupings.map(d => new SelectionItem(d.value, d.name));
            }
        });
  }

}
