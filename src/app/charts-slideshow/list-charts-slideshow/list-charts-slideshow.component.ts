import { CommonService } from '../../shared/services/common.service';
import { ListChartViewModel } from '../../charts/list-chart/list-chart.viewmodel';
import { ViewSlideShowActivity } from '../../shared/authorization/activities/slideshows/view-slideshow.activity';
import { AddSlideshowActivity } from '../../shared/authorization/activities/slideshows/add-slideshow.activity';
import { UpdateSlideshowActivity } from '../../shared/authorization/activities/slideshows/update-slideshow.activity';
import { DeleteSlideshowActivity } from '../../shared/authorization/activities/slideshows/delete-slideshow.activity';
import { Activity } from '../../shared/authorization/decorators/component-activity.decorator';
import { ShowChartSlideshowComponent } from '../show-chart-slideshow/show-chart-slideshow.component';
import { DeleteModalComponent } from '../delete-modal/delete-modal.component';
import { ModalComponent, MaterialFormsModule, MaterialUserInterfaceModule, MenuItem } from '../../ng-material-components';
import { Apollo } from 'apollo-angular';
import { Router } from '@angular/router';
import { IChartSlideshow } from '../shared/model/chartslideshow.model';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';



const ListChartSlideShowQuery = require('graphql-tag/loader!../shared/graphql/list-charts-slideshow.query.gql');
const RemoveSlideshow = require('graphql-tag/loader!../shared/graphql/del-slideshow.mutation.gql');



@Activity(ViewSlideShowActivity)
@Component({
    selector: 'kpi-list-charts-slideshow',
    templateUrl: './list-charts-slideshow.component.pug',
    styleUrls: ['./list-charts-slideshow.component.scss'],
    providers: [ListChartViewModel, AddSlideshowActivity, UpdateSlideshowActivity, DeleteSlideshowActivity]
})
export class ListChartsSlideshowComponent implements OnInit, OnDestroy {
    @ViewChild(ShowChartSlideshowComponent) slideshowComponent: ShowChartSlideshowComponent;
    @ViewChild('removeConfirmationModal') removeModal: ModalComponent;

    private _subscription: Subscription[] = [];

    slideshowModel: IChartSlideshow;
    slideshowItems: IChartSlideshow[];

    actionItems: MenuItem[] = [
        {
            id: 'edit',
            icon: 'edit',
        },
        {
            id: 'delete',
            icon: 'delete'
        }
    ];

    _slideShow: IChartSlideshow;
    slideShowList: IChartSlideshow[];
    slideshowPlaying: IChartSlideshow = null;
    actionItemsTarget: string;
    loading = false;
    listEmpty = false;

    constructor(
        private _router: Router,
        private _apollo: Apollo,
        public vm: ListChartViewModel,
        public addSlideshowActivity: AddSlideshowActivity,
        public updateSlideshowActivity: UpdateSlideshowActivity,
        public deleteSlideshowActivity: DeleteSlideshowActivity
    ) { }

    ngOnInit() {
        this.vm.addActivities([this.addSlideshowActivity, this.updateSlideshowActivity, this.deleteSlideshowActivity]);
        this._listChartSlideShow();
        this._disableActionItem();
    }

    ngOnDestroy() {
        CommonService.unsubscribe(this._subscription);
    }

    private _listChartSlideShow() {
        const that = this;

        that.loading = true;
        this._subscription.push(that._apollo.watchQuery<any>({
            query: ListChartSlideShowQuery,
            fetchPolicy: 'network-only'
        })
            .valueChanges.subscribe(response => {
                that.slideShowList = response.data.slideshows;
                that.listEmpty = that.slideShowList.length === 0;
                that.loading = false;
            }));
    }

    addSlideshow() {
        this._router.navigateByUrl('/charts-slideshow/add');
    }

    runSlideShow(slideshow: IChartSlideshow) {
        this.slideshowPlaying = slideshow;
    }

    stopSlideshow() {
        this.slideshowPlaying = null;
    }

    _editSlideShow(item: IChartSlideshow) {
        this._router.navigate(['charts-slideshow', 'edit', item._id]);
    }

    _delSlideShow(item: IChartSlideshow) {
        this.slideshowModel = item;
        this.removeModal.open();
    }

    confirmRemove(): void {
        const that = this;

        this._apollo.mutate({
            mutation: RemoveSlideshow,
            variables: {
                _id: that.slideshowModel._id
            }
        })
            .toPromise()
            .then(r => {
                that._listChartSlideShow();
            });
        this.removeModal.close();
    }

    cancelRemove(): void {
        this.removeModal.close();
    }

    actionClicked(item, row) {
        this.actionItemsTarget = item.id;

        switch (item.id) {
            case 'edit':
                this._editSlideShow(row);
                break;

            case 'delete':
                this._delSlideShow(row);
                break;
        }
    }

    private _disableActionItem(): void {
        if (this.actionItems && this.actionItems.length) {
            this.actionItems.forEach(item => {
                if (item.id === 'edit') {
                    item.disabled = this._editSlideShowPermission();
                }
                if (item.id === 'delete') {
                    item.disabled = this._deleteSlideShowPermission();
                }
            });
        }
    }

    // check if user have permission to edit slideshow
    private _editSlideShowPermission() {
        return !this.vm.authorizedTo('UpdateSlideshowActivity');
    }

    // check if user have permission to delete slideshow
    private _deleteSlideShowPermission() {
        return !this.vm.authorizedTo('DeleteSlideshowActivity');
    }

}
