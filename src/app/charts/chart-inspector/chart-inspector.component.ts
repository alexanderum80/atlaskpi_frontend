import { CommonService } from '../../shared/services/common.service';
import { DeleteChartActivity } from '../../shared/authorization/activities/charts/delete-chart.activity';
import { ModifyChartActivity } from '../../shared/authorization/activities/charts/modify-chart.activity';
import { CloneChartActivity } from '../../shared/authorization/activities/charts/clone-chart.activity';
import { ChartInspectorViewModel } from './chart-inspector.viewmodel';
import { ModalComponent } from '../../ng-material-components';
import { DeleteChartMutation, DeleteMapMutation } from '../shared/graphql';
import { IMutationResponse } from '../../shared/models';
import { OverlayComponent } from '../../shared/ui/overlay/overlay.component';
import { ListChartService } from '../shared/services/list-chart.service';
import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Router } from '@angular/router';
import { IModalError } from '../../shared/interfaces/modal-error.interface';
import { Subscription } from 'rxjs/Subscription';

interface IDeleteChartResponse {
  deleteChart: IMutationResponse;
}

@Component({
  selector: 'kpi-chart-inspector',
  templateUrl: './chart-inspector.component.pug',
  styleUrls: ['./chart-inspector.component.scss'],
  providers: [ChartInspectorViewModel, CloneChartActivity, ModifyChartActivity, DeleteChartActivity]
})
export class ChartInspectorComponent implements OnInit, OnDestroy {
    @Input() width = 300;
    @ViewChild(OverlayComponent) removeOverlay: OverlayComponent;
    @ViewChild('errorModal') errorModal: ModalComponent;

    item: any;
    deleted = false;

    lastError: IModalError;
    private _subscription: Subscription[] = [];

    constructor(private _listChartService: ListChartService,
                private _apollo: Apollo,
                private _router: Router,
                public vm: ChartInspectorViewModel,
                public cloneChartActivity: CloneChartActivity,
                public modifyChartActivity: ModifyChartActivity,
                public deleteChartActivity: DeleteChartActivity
                ) { }

    ngOnInit() {
      this._listChartService.setActive(null);
      this._subscribeToChartItemChanges();
      this.vm.addActivities([this.cloneChartActivity, this.modifyChartActivity, this.deleteChartActivity]);
    }

    ngOnDestroy() {
      CommonService.unsubscribe(this._subscription);
    }

    hideInspector() {
        this._listChartService.hideInspector();
    }

    private _subscribeToChartItemChanges() {
      const that = this;
      this._subscription.push(
        this._listChartService.selected$.subscribe(chart => {
          if (!chart) {
            return that.item = undefined;
          }

          if (that.item !== chart) {
            that.removeOverlay.hide();
          }

          that.item = chart;
        })
      );
    }

    removeConfirmation() {
      this.removeOverlay.show();
    }

    cancelRemove() {
      this.removeOverlay.hide();
    }

    edit() {
       this._router.navigate(['/charts/edit', this.item._id]);
    }

    clone() {
      this._router.navigate(['/charts/clone', this.item._id]);
    }
    DeleteMap() {
      const that = this;
      this._subscription.push(
        this._apollo.mutate<IDeleteChartResponse>({
            mutation: DeleteMapMutation,
            variables: { id: that.item._id },
            updateQueries: {
              ListMapQuery: (previousResult, { mutationResult }) => {
                const { deleteMap } = mutationResult.data;
                const { success, errors } = deleteMap;

                if (!success && errors && errors.length) {
                  const dependency = errors.find(e => e.field === '__isDependencyOf');
                  that.lastError = {
                    title: 'Error removing map',
                    msg: 'A map cannot be remove while it\'s being used. The following element(s) are currently using this map: ',
                    items: dependency.errors
                  };
                  that.errorModal.open();
                  return;
                }
                let listMaps = (<any>previousResult).listMaps.map(m => {
                  return JSON.parse(m);
                });
                const currMaps = (<any>listMaps).filter( c => c._id !== that.item._id);
                listMaps = currMaps.map(c => {
                  return JSON.stringify(c);
                });
                return { listMaps: listMaps };
              }
            }
        })
        .subscribe(response => {
            if (response.data.deleteMap.success) {
                this._successfullChartDeletion();
            }
        })
      );
    }

    DeleteChart() {
      const that = this;
      this._subscription.push(
        this._apollo.mutate<IDeleteChartResponse>({
            mutation: DeleteChartMutation,
            variables: { id: that.item._id },
            updateQueries: {
              ListChartQuery: (previousResult, { mutationResult }) => {
                const { deleteChart } = mutationResult.data;
                const { success, errors } = deleteChart;

                if (!success && errors && errors.length) {
                  const depenency = errors.find(e => e.field === '__isDependencyOf');
                  that.lastError = {
                    title: 'Error removing chart',
                    msg: 'A chart cannot be remove while it\'s being used. The following element(s) are currently using this chart: ',
                    items: depenency.errors
                  };
                  that.errorModal.open();
                  return;
                }
                const listCharts = (<any>previousResult).listCharts;
                const currCharts = (<any>listCharts).data.filter( c => c._id !== that.item._id);

                listCharts.data = currCharts;
                return { listCharts: listCharts };
              }
            }
        })
        .subscribe(response => {
            if (response.data.deleteChart.success) {
                that._successfullChartDeletion();
            }
        })
      );
    }
    remove() {
      if (this.item.size) {
        this.DeleteMap();
      } else {
        this.DeleteChart();
      }
    }

    private _successfullChartDeletion() {
      const that = this;
      this.deleted = true;
      setTimeout(() => {
        that.removeOverlay.hide();
        that.item = null;
      }, 2000);

      setTimeout(() => {
        that.deleted = false;
      }, 3000);

    }

}
