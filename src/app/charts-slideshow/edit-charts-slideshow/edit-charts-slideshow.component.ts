import 'rxjs/add/operator/do';
import 'rxjs/add/operator/switchMap';

import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Apollo, QueryRef } from 'apollo-angular';
import { ApolloQueryResult } from 'apollo-client';
import { ObservableInput } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import Sweetalert from 'sweetalert2';

import { IChart, ListChartsQueryResponse } from '../../charts/shared/models/chart.models';
import {
    UpdateSlideshowActivity
} from '../../shared/authorization/activities/slideshows/update-slideshow.activity';
import { Activity } from '../../shared/authorization/decorators/component-activity.decorator';
import { DialogResult } from '../../shared/models/dialog-result';
import { ApolloService } from '../../shared/services/apollo.service';
import { ChartSlideshow, IChartSlideshow } from '../shared/model/chartslideshow.model';
import { ChartSlideshowService } from '../shared/service/chartslideshow.service';
import { ShowChartSlideshowComponent } from '../show-chart-slideshow/show-chart-slideshow.component';
import {
    GenericSelectionItem,
    GenericSelectionService,
    IGenericSelectionItem,
} from '../../shared/services/generic-selection.service';


const SlideshowById = require('graphql-tag/loader!../shared/graphql/chart-slideshow-by-id.query.gql');
const UpdateSlideshow = require('graphql-tag/loader!../shared/graphql/update-chart-slideshow.mutation.gql');
const RemoveSlideshow = require('graphql-tag/loader!../shared/graphql/del-slideshow.mutation.gql');
const slideshowByName = require('graphql-tag/loader!../shared/graphql/chart-slideshow-by-name.query.gql');

@Activity(UpdateSlideshowActivity)
@Component({
    selector: 'kpi-edit-charts-slideshow',
    templateUrl: './edit-charts-slideshow.component.pug',
    styleUrls: ['./edit-charts-slideshow.component.scss'],
    providers: [GenericSelectionService]
})
export class EditChartsSlideshowComponent implements OnInit, OnDestroy {
    @ViewChild(ShowChartSlideshowComponent) slideshowModal: ShowChartSlideshowComponent;

    slideshowModel: IChartSlideshow;
    fg: FormGroup = new FormGroup({});
    slideshow: IChartSlideshow;
    inPreview = false;
    loading = true;
    subscriptions: Subscription[] = [];
    listOfChartsQuery: QueryRef < ListChartsQueryResponse > ;

    selectedItems: IGenericSelectionItem[] = [];
    selectedCharts: IChart[] = [];
    slideShowId: string;

    constructor(private _routeActive: ActivatedRoute, private _apollo: Apollo,
        private _route: Router, private _selectionService: GenericSelectionService,
        private _apolloService: ApolloService,
        private _chartSlideshowService: ChartSlideshowService) {
        this.fg = new FormGroup({});
    }

    ngOnInit() {
        this._selectionService.enableMultiSelect();
        const that = this;
        this.subscriptions.push(this._selectionService.selection$.subscribe(selectedItems => {
            that.selectedItems = selectedItems;
            that.selectedCharts = selectedItems.filter(i => i.type === 'chart').map(o => o.payload);
            this.slideshow = that._generateSlideShowModel();
        }));

        this._loadSlideShowSubscription();
        this._subscribeToFormChanges();

        this._chartSlideshowService.updateExistDuplicatedName(false);
    }

    ngOnDestroy() {
        this.subscriptions.forEach(s => {
            if (s && !s.closed) {
                s.unsubscribe();
            }
        });
    }

    private _loadSlideShowSubscription() {
        const that = this;
        this.subscriptions.push(
            this._routeActive.params
            .do((params: Params) => that.slideShowId = params['id'])
            .switchMap((params: Params) => that._getSlideshowById(params['id']))
            .subscribe((response: ApolloQueryResult < any > ) => {
                this.loading = false;
                const rawSlideShow = response.data.slideshowById;
                that.slideshowModel = rawSlideShow;
                that.slideshow = that._generateSlideShowModel();
            })
        );
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

    toggleChartSelection(item: any) {
        this._selectionService.toggleSelection(new GenericSelectionItem(item, 'chart'));
    }

    saveSlideshow() {
        const that = this;
        this._apolloService.networkQuery < IChartSlideshow > (slideshowByName, {
            name: this.fg.controls['name'].value
        }).then(d => {
            if (d.slideshowByName && d.slideshowByName._id !== that.slideShowId) {

                this._chartSlideshowService.updateExistDuplicatedName(true);

                this.fg.controls['name'].setErrors({
                    forbiddenName: true
                });

                return Sweetalert({
                    title: 'Duplicated name!',
                    text: 'You already have a Slideshow with that name. Please change the name and try again.',
                    type: 'error',
                    showConfirmButton: true,
                    confirmButtonText: 'Ok'
                });
            }

            this.subscriptions.push(
                this._apollo.mutate({
                    mutation: UpdateSlideshow,
                    variables: {
                        _id: that.slideShowId,
                        input: {
                            name: that.slideshow.name,
                            description: that.slideshow.description,
                            charts: that.selectedCharts.map(c => c._id)
                        }
                    }
                }).subscribe((response) => {
                    that._route.navigate(['charts-slideshow']);
                })
            );
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
        this._route.navigate(['charts-slideshow']);
    }

    confirmRemove(): void {
        const that = this;
        this.subscriptions.push(
            this._apollo.mutate({
                mutation: RemoveSlideshow,
                variables: {
                    _id: this.slideshowModel._id
                }
            })
            .subscribe((response) => {
                this._route.navigate(['charts-slideshow']);
            })
        );
    }


    showItem() {
        // this.slideshowModal.show(this.slideshowModel);
    }

    preview() {
        this.inPreview = true;
    }

    stopPreview() {
        this.inPreview = false;
    }

    private _getSlideshowById(id: string): ObservableInput < ApolloQueryResult < any >> {
        return <any > this._apollo.query < IChartSlideshow > ({
            query: SlideshowById,
            fetchPolicy: 'network-only',
            variables: {
                _id: id
            }
        });
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
                this.saveSlideshow();
                break;

            case DialogResult.DELETE:
                this.confirmRemove();
                break;

        }
    }
}