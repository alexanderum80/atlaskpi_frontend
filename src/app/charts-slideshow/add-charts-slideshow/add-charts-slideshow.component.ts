import { AddSlideshowActivity } from '../../shared/authorization/activities/slideshows/add-slideshow.activity';
import { Activity } from '../../shared/authorization/decorators/component-activity.decorator';
import { Subscription } from 'rxjs/Subscription';
import { GenericSelectionItem, GenericSelectionService } from './../../shared/services/generic-selection.service';
import { IGenericSelectionItem } from '../../shared/services/generic-selection.service';
import { DialogResult } from '../../shared/models/dialog-result';
import { ShowChartSlideshowComponent } from '../show-chart-slideshow/show-chart-slideshow.component';
import { SelectedChartsService } from '../../charts/shared/services/selected-charts.service';
import { ChartSlideshow, IChartSlideshow } from '../shared/model/chartslideshow.model';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Apollo } from 'apollo-angular';
import { ApolloQueryResult } from 'apollo-client';
import { Observable } from 'rxjs/Observable';
import { IChart, ListChartsQueryResponse } from '../../charts/shared/models/chart.models';
import { AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ApolloService } from '../../shared/services/apollo.service';
import { ChartSlideshowService } from '../shared/service/chartslideshow.service';
import Sweetalert from 'sweetalert2';


const ListChartsQuery = require('graphql-tag/loader!../shared/graphql/list-charts.query.gql');
const AddSlideShowMutation = require('graphql-tag/loader!../shared/graphql/add-chart-slideshow.mutation.gql');
const slideshowByName = require('graphql-tag/loader!../shared/graphql/chart-slideshow-by-name.query.gql');

@Activity(AddSlideshowActivity)
@Component({
  selector: 'kpi-add-charts-slideshow',
  templateUrl: './add-charts-slideshow.component.pug',
  styleUrls: ['./add-charts-slideshow.component.scss'],
  providers: [GenericSelectionService]
})
export class AddChartsSlideshowComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(ShowChartSlideshowComponent) slideshowModal: ShowChartSlideshowComponent;

  slideshow: IChartSlideshow;
  charts: IChart[] = [];
  fg: FormGroup;
  show: string[];
  inPreview = false;
  componentTitle = 'Add New Charts SlideShow';


  subscriptions: Subscription[] = [];
  allCharts: IChart[] = [];
  selectedItems: IGenericSelectionItem[] = [];
  selectedCharts: IChart[] = [];

  constructor(
    private _apollo: Apollo,
    private _router: Router,
    private _selectionService: GenericSelectionService,
    private _apolloService: ApolloService,
    private _chartSlideshowService: ChartSlideshowService) {
    this.fg = new FormGroup({});
  }

  ngOnInit() {
    const that = this;
    this._selectionService.enableMultiSelect();
    this.subscriptions.push(this._selectionService.selection$.subscribe(selectedItems => {
      that.selectedItems = selectedItems;
      that.selectedCharts = selectedItems.filter(i => i.type === 'chart').map(o => o.payload);
      this.slideshow = that._generateSlideShowModel();
    }));

    this._subscribeToFormChanges();

    this._chartSlideshowService.updateExistDuplicatedName(false);
   }

  private _subscribeToFormChanges() {
    const that = this;
    // for update values and validate the formulary
    this.subscriptions.push(
    that.fg.valueChanges
    .subscribe(slideshow => {
        that.slideshow = that._generateSlideShowModel();
    }));
  }

  ngAfterViewInit() {
    this._subscribeToNameChanges();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => {
      if (s && !s.closed) {
        s.unsubscribe();
      }
    });
  }

  addSlideShow() {
    if (!this.selectedCharts) {
      alert(' You must select any chart');
      return;
    }
    const that = this;
    this._apolloService.networkQuery < IChartSlideshow > (slideshowByName, { name: this.fg.controls['name'].value }).then(d => {
      if (d.slideshowByName) {

          this._chartSlideshowService.updateExistDuplicatedName(true);

          this.fg.controls['name'].setErrors({forbiddenName: true});

          return Sweetalert({
              title: 'Duplicated name!',
              text: 'You already have a Slideshow with that name. Please change the name and try again.',
              type: 'error',
              showConfirmButton: true,
              confirmButtonText: 'Ok'
          });
      }

      this.subscriptions.push(
      that._apollo.mutate({
        mutation: AddSlideShowMutation,
        variables: {
          input: {
            name: that.slideshow.name,
            description: that.slideshow.description,
            charts: that.selectedCharts.map(c => c._id)
          }
        },
        refetchQueries: ['Slideshows']
      }).subscribe((response) => {
        this._router.navigate(['/charts-slideshow']);
      }));
    });
  }

  private _generateSlideShowModel(): IChartSlideshow {

    return ChartSlideshow.Create(
      null,
      this.fg.value.name || null,
      this.fg.value.description || null,
      this.selectedCharts.map(s => s._id));
  }

  cancel() {
    this._router.navigateByUrl('/charts-slideshow');
  }

  preview() {
    this.inPreview = true;
  }

  stopPreview() {
    this.inPreview = false;
  }

  onDialogResult(result: DialogResult) {
    switch (result) {
      case DialogResult.CANCEL:
          this.cancel();
          break;

      case DialogResult.PREVIEW:
          this.preview();
          break;

      case DialogResult.SAVE:
          this.addSlideShow();
          break;

    }
  }

  private _subscribeToNameChanges() {
    this.fg.controls['name'].valueChanges.subscribe(n => {
        if (n === '') {
            this.fg.controls['name'].setErrors({required: true});
        } else {
            if (this._chartSlideshowService.getExistDuplicatedName() === true) {
                this._apolloService.networkQuery < IChartSlideshow > (slideshowByName, { name: n }).then(d => {
                    if (d.slideshowByName) {
                      this.fg.controls['name'].setErrors({forbiddenName: true});
                    } else {
                      this.fg.controls['name'].setErrors(null);
                    }
                });
            }
        }
    });
  }

}
