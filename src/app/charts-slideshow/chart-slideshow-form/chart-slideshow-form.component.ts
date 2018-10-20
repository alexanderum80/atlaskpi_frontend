import { CommonService } from '../../shared/services/common.service';
import { AutoUnsubscribe } from '../../data-source/shared/auto-unsubscribe';
import { IChartSlideshow } from '../shared/model/chartslideshow.model';
import { dashboardGraphqlActions } from '../../dashboards/shared/graphql';
import { Subscription } from 'rxjs/Subscription';
import { GenericSelectionItem, GenericSelectionService } from '../../shared/services/generic-selection.service';
import { SelectedChartsService } from '../../charts/shared/services/selected-charts.service';
import { ModalComponent } from '../../ng-material-components';
import { DialogResult } from '../../shared/models/dialog-result';
import { IChart, ListChartsQueryResponse } from '../../charts/shared/models';
import { FormGroup, FormControl } from '@angular/forms';
import { Component, Input, OnInit, Output, EventEmitter, ViewChild, OnDestroy } from '@angular/core';
import { Apollo, QueryRef } from 'apollo-angular';


const ListChartsQuery = require('graphql-tag/loader!../shared/graphql/list-charts.query.gql');

@Component({
  selector: 'kpi-chart-slideshow-form',
  templateUrl: './chart-slideshow-form.component.pug',
  styleUrls: ['./chart-slideshow-form.component.scss']
})
export class ChartSlideshowFormComponent implements OnInit, OnDestroy {
  @Output() dialogResult = new EventEmitter<DialogResult>();
  @Input() fg: FormGroup;
  @Input() editMode = false;
  @Input() slideShowModel: IChartSlideshow = null;
  @ViewChild('removeConfirmationModal') removeModal: ModalComponent;
  charts: IChart[] = [];

  subscriptions: Subscription[] = [];
  listOfChartsQuery: QueryRef<ListChartsQueryResponse>;
  allCharts: IChart[] = [];

  constructor(private _apollo: Apollo, private _selectionService: GenericSelectionService) { }

  ngOnInit() {
    this._loadCharts();
  }

  ngOnDestroy() {
    CommonService.unsubscribe(this.subscriptions);
  }

  private _loadCharts() {
    const that = this;
    this.listOfChartsQuery = this._apollo.watchQuery<ListChartsQueryResponse> ({
      query: dashboardGraphqlActions.listCharts,
      fetchPolicy: 'network-only'
    });

    this.subscriptions.push(
        that.listOfChartsQuery.valueChanges.subscribe(response => {
        that.allCharts = response.data.listCharts.data;
        that._initializeForm();
    }));
  }

  private _initializeForm() {
    if (!this.slideShowModel) { return; }

    const fgValues = {
      name: this.slideShowModel.name,
      description: this.slideShowModel.description
    };

    this.fg.patchValue(fgValues);

    const that = this;
    this.slideShowModel.charts.forEach(id => {
        const item = that.allCharts.find(c => c._id === id);
        if (item) {
          that.toggleChartSelection(item);
        }
    });
  }

  toggleChartSelection(item: any) {
    this._selectionService.toggleSelection(new GenericSelectionItem(item, 'chart'));
  }

  cancelRemove(): void {
    this.removeModal.close();
  }

  delSlideshow() {
    this.removeModal.open();
  }

  confirmRemove() {
    this.dialogResult.emit(DialogResult.DELETE);
  }

  showItem() {
    this.dialogResult.emit(DialogResult.PREVIEW);
  }

  saveSlideshow() {
    this.dialogResult.emit(DialogResult.SAVE);
  }

  cancel() {
    this.dialogResult.emit(DialogResult.CANCEL);
  }

  get validForm(): boolean {
    return this.fg.valid;
  }

}
