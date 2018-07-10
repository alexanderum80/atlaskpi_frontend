import { ShowMapFormViewModel } from './show-map-form.viewmodel';
import {
  Component,
  ElementRef,
  OnInit,
  Renderer,
  ViewChild,
  AfterViewInit
} from '@angular/core';
import {ApolloService} from '../../shared/services/apollo.service';
import { IDataSource } from '../../shared/domain/kpis/data-source';

const dataSources = require('./data-sources.gql');

@Component({
  selector: 'kpi-show-map-form',
  templateUrl: './show-map-form.component.pug',
  styleUrls: ['./show-map-form.component.scss'],
  providers: [ShowMapFormViewModel]
})
export class ShowMapFormComponent implements OnInit, AfterViewInit {
  loading: ElementRef;
  // @ViewChild('loading') loading: ElementRef;
  @ViewChild('loading') set loadingElementRef(content: ElementRef) {
    if (content) {
      this.loading = content;
    }
  }

  isLoading = true;

  constructor(
      public vm: ShowMapFormViewModel,
      private _apolloService: ApolloService,
      private _renderer: Renderer) {
    this.vm.initialize(null);
  }

  ngOnInit() {
    this._getDataSources();
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

    this._apolloService.networkQuery<{ dataSources: IDataSource[] }>(dataSources)
        .then(res => {
            that.isLoading = false;
            that.vm.updateDataSources(res.dataSources);
        });
  }

}
