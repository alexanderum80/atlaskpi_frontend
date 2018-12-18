import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Apollo, QueryRef } from 'apollo-angular';
import gql from 'graphql-tag';
import { toArray, map } from 'lodash';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import SweetAlert from 'sweetalert2';

import { LegendService } from '../../maps/shared/legend.service';
import { IMapMarker } from '../../maps/shared/models/map-marker';
import { ILegendColorConfig } from '../../maps/show-map/show-map.component';
import { objectWithoutProperties } from '../../shared/helpers/object.helpers';
import { ApolloService } from '../../shared/services/apollo.service';
import { AuthenticationService } from '../../shared/services/authentication.service';
import { BrowserService } from '../../shared/services/browser.service';
import { CommonService } from '../../shared/services/common.service';
import { UserService } from '../../shared/services/user.service';
import { IWidget, WidgetSizeEnum } from '../../widgets/shared/models';
import { WidgetAlertComponent } from '../../widgets/widget-alert/widget-alert.component';
import { FormatterFactory, yAxisFormatterProcess } from '../shared/extentions/chart-formatter.extention';
import { IDashboard } from '../shared/models';
import { chartsGraphqlActions } from '../../charts/shared/graphql/charts.graphql-actions';
import { IDateRangeItem } from '../../shared/models/date-range';
import { SocialWidgetBase } from '../../social-widgets/models/social-widget-base';
import { WidgetSizeMap } from '../../widgets/shared/models/widget.models';
import { dashboardGraphqlActions } from '../shared/graphql';
import { ModifyChartActivity } from 'src/app/shared/authorization/activities/charts/modify-chart.activity';

const Highcharts = require('highcharts/js/highcharts');

const removeWidgetFromDashboardGql = require('graphql-tag/loader!./remove-widget-from-dashboard.mutation.gql');
const DashboardQuery = gql`
    query Dashboard($id: String!) {
        dashboard(id: $id) {
            _id
            name
            description
            charts
            maps
            widgets
            socialwidgets
            owner
            users
        }
    }
`;

export interface AccessLevelsResponse {
    users: string[];
    accessTypes: string[];
}

export interface DashboardResponse {
    dashboard: {
        _id: string;
        name: string;
        charts: string[];
        widgets: string[];
        socialwidgets: string[];
        maps: string[];
        loading: boolean;
        owner: string;
        users: string[];
    };
}


const mapMarkersQuery = require('graphql-tag/loader!./map-markers.gql');
const socialWidgetQuery = require('graphql-tag/loader!./social-widgets.query.gql');

@Component({
    selector: 'kpi-dashboard-show',
    templateUrl: './dashboard-show.component.pug',
    styleUrls: ['./dashboard-show.component.scss'],
    providers: [ModifyChartActivity]
})
export class DashboardShowComponent implements OnInit, OnDestroy {
    @Input() isFromDashboard = false;
    @Input() dashboardPayLoad: IDashboard[];
    @ViewChild('widgetAlert') widgetAlert: WidgetAlertComponent;

    mapInViewport = false;

    bigWidgets: any[] = [];
    smallWidgets: any[] = [];
    charts: any[] = null;
    maps: any[] = [];
    refreshing = false;
    isMobile: boolean;
    showMap = true;
    loading = true;
    isEditChartFromDashboard = false;
    idChartSelected: string;

    dateRanges: IDateRangeItem[] = [];
    mapMarkers: IMapMarker[];
    legendColors: ILegendColorConfig[];

    socialWidgets: SocialWidgetBase[] = [];
    dashboardName: string;
    dashboardId: string;

    private _dashboardIdSubject = new Subject<string>();

    private _subscription: Subscription[] = [];
    private _dashboardQuery: QueryRef<any>;
    private _rawDashboard: IDashboard;

    constructor(
        private _apollo: Apollo,
        private _apolloService: ApolloService,
        private _route: ActivatedRoute,
        private _browserSerivce: BrowserService,
        private _userService: UserService,
        private _authService: AuthenticationService,
        private _router: Router,
        public modifyChartActivity: ModifyChartActivity,
        private _legendService: LegendService) {
        Highcharts.setOptions({
            lang: {
                decimalPoint: '.',
                thousandsSep: ','
            }
        });

        this.isMobile = _browserSerivce.isMobile();
    }

    onMapInViewportChange(inViewport: boolean) {
        if (inViewport && !this.mapInViewport) {
            this.mapInViewport = true;
        }
    }

    ngOnInit() {
        this._dateRangesQuery();
        this.legendColors = this._legendService.getLegendColors();

        const that = this;
        this._getSocialWidgets();
        if (this.isFromDashboard) {
            this._loadDashboardData(this.dashboardPayLoad);
        } else {
            this._dashboardQuery = this._apollo.watchQuery<DashboardResponse>({
                query: DashboardQuery,
                variables: {
                    id: ''
                },
                fetchPolicy: 'network-only'
            });

            this._route.params.subscribe(params => {
                const apolloData = (<any>that._apollo.getClient().store.getCache()).data.data;
                const arr = toArray(apolloData);
                const dashboards = arr.filter(a => a['__typename'] === 'Dashboard');

                that.dashboardId = params.id;

                if (params.id && this._authService.authenticated) {
                    if (params.id) {
                        that._loadDashboard(params.id);
                        this.loading = true;
                    }
                } else {
                    setTimeout(function () {
                        // hack hack hack
                        if (dashboards && dashboards.length > 0) {
                            const id = dashboards[0]._id;
                            that._loadDashboard(id);
                        }
                    }, 100);
                }
                // this._subscription.push(this._apollo.watchQuery < DashboardResponse > ({
                //     query: DashboardQuery,
                //     variables: {
                //         id: params.id
                //     },
                //     fetchPolicy: 'network-only'
                // })
                // .valueChanges.subscribe(({
                //     data  }) => {
                //         if (!data.dashboard) {
                //             that.bigWidgets = [];
                //             that.smallWidgets = [];
                //             that.charts = [];
                //             return;
                //         }

                //         this._loadDashboardData(data.dashboard);
                //     })
                // );
            });

        }
    }

    onActionClicked(item: any) {
        switch (item.id) {
            case 'alert':
                this.widgetAlert.open(item.widget);
                break;
            case 'edit':
                this._router.navigateByUrl(`/widgets/edit/${item.payload.id}`);
                break;
            case 'clone':
                this._router.navigateByUrl(`/widgets/clone/${item.payload.id}`);
                break;
            case 'delete':
                this._removeWidget(item.payload.id);
                break;
        }
    }

    private _removeWidget(id: string): void {
        if (!id) {
            return;
        }

        let dashboardId: string;

        if (!this.dashboardId && this._rawDashboard._id) {
            dashboardId = this._rawDashboard._id;
        } else {
            dashboardId = this.dashboardId;
        }

        if (!dashboardId) {
            return;
        }

        const that = this;

        SweetAlert({
            type: 'warning',
            title: 'Are you sure you want to remove this widget from this dashboard?',
            text: 'Remember that you can always put it back from the dashboard screen',
            showConfirmButton: true,
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'Cancel',
        }).then(result => {
            if (result.value === true) {
                this._apollo.mutate({
                    mutation: removeWidgetFromDashboardGql,
                    variables: {
                        dashboardId: dashboardId,
                        widgetId: id
                    }
                }).subscribe(({ data }) => {
                    if (!data || !data.deleteWidgetFromDashboard) {
                        return;
                    }

                    const res = data.deleteWidgetFromDashboard;
                    if (res.success && dashboardId) {
                        that._loadDashboard(dashboardId);
                    }
                });
            }
        });
    }

    private _loadDashboardData(dashboard: any) {
        const that = this;

        if (!dashboard) {
            that.bigWidgets = [];
            that.smallWidgets = [];
            that.socialWidgets = [];
            that.charts = [];
            return;
        }

        this.dashboardName = dashboard.name || 'Untitled';
        if (dashboard.charts) {
            that.charts = dashboard.charts.map(c => {
                if (!c) { return; }
                try {
                    const rawChart = JSON.parse(c);
                    let definition = this._processChartTooltipFormatter(rawChart.chartDefinition);
                    yAxisFormatterProcess(definition);
                    definition = this._processPieChartPercent(rawChart.chartDefinition);
                    rawChart.chartDefinition = definition;
                    return rawChart;
                } catch (err) {
                    return c;
                }
            });
        }
        if (dashboard.maps.length > 0) {
            that.maps = dashboard.maps.map(dm => JSON.parse(dm));
            that.maps.forEach(m => {
                m.markers = m.markers.map(mk => objectWithoutProperties(mk, ['__typename']));
            });
            this.showMap = true;
        } else {
            
            this.showMap = false;
        }
        if (dashboard.widgets) {
            const widgets: IWidget[] = dashboard.widgets.map(w => {
                try {
                    const widget = JSON.parse(w);
                    return widget;
                } catch (err) {
                    console.dir(w);
                    return w;
                }
            });
            that.smallWidgets = widgets.filter(w => WidgetSizeMap[w.size] === WidgetSizeEnum.Small);
            that.smallWidgets.forEach(sWidget => sWidget.preview = true);
            that.bigWidgets = widgets.filter(w => WidgetSizeMap[w.size] === WidgetSizeEnum.Big);
            that.bigWidgets.forEach(bWidget => bWidget.preview = true);
        }

        if (dashboard.socialwidgets) {
            const socialWidgetsSource = dashboard.socialwidgets.map(sw => {
                try {
                    const swidget = JSON.parse(sw);
                    return swidget;
                } catch (err) {
                    console.dir(sw);
                    return sw;
                }
            });
            that.socialWidgets = socialWidgetsSource.map(d => new SocialWidgetBase(<any>objectWithoutProperties(d, ['__typename'])));
        }
        this.loading = false;
    }

    ngOnDestroy() {
        CommonService.unsubscribe(this._subscription);
    }

    get isMainDashboard(): boolean {
        return this.dashboardName === 'Main';
    }

    get showSocialWidgets(): boolean {
        return this.socialWidgets.length > 0;
    }

    private _loadDashboard(id) {
        this._dashboardQuery.refetch({
            id: id
        }).then(res => {
            this._processDashboardResponse(res.data);
        });
    }

    get bigMaps(): any {
        return this.maps ? this.maps.filter(m => m.size === 'big') : undefined;
    }

    get smallMaps(): any {
        return this.maps ? this.maps.filter(m => m.size === 'small') : undefined;
    }
    private _processDashboardResponse(data) {
        const that = this;

        this.loading = false;

        if (!data || !data.dashboard) {
            that.bigWidgets = [];
            that.smallWidgets = [];
            that.charts = [];
            that.maps = [];
            return;
        }

        this._rawDashboard = data.dashboard;
        this.dashboardId = data.dashboard._id;
        this.dashboardName = data.dashboard.name;

        if (data.dashboard.maps.length > 0) {
            that.maps = data.dashboard.maps.map(dm => JSON.parse(dm));
            that.maps.forEach(m => {
                m.markers = m.markers.map(mk => objectWithoutProperties(mk, ['__typename']));
            });
            this.showMap = true;
        } else {
            this.showMap = false;
        }
        if (data.dashboard.charts) {
            that.charts = data.dashboard.charts.map(c => {
                if (!c) {
                    return;
                }

                try {
                    const rawChart = JSON.parse(c);
                    let definition = this._processChartTooltipFormatter(rawChart.chartDefinition);
                    yAxisFormatterProcess(definition);
                    definition = this._processPieChartPercent(rawChart.chartDefinition);
                    rawChart.chartDefinition = definition;
                    return rawChart;
                } catch (err) {
                    return c;
                }
            });
        }

        if (data.dashboard.widgets) {
            const widgets: IWidget[] = data.dashboard.widgets.map(w => {
                try {
                    const widget = JSON.parse(w);
                    return widget;
                } catch (err) {
                    console.dir(w);
                    return w;
                }
            });
            that.smallWidgets = widgets.filter(w => WidgetSizeMap[w.size] === WidgetSizeEnum.Small);
            that.smallWidgets.forEach(sWidget => sWidget.preview = true);
            that.bigWidgets = widgets.filter(w => WidgetSizeMap[w.size] === WidgetSizeEnum.Big);
            that.bigWidgets.forEach(bWidget => bWidget.preview = true);
        }
        if (data.dashboard.socialwidgets) {
            const socialWidgetsSource = data.dashboard.socialwidgets.map(sw => {
                try {
                    const swidget = JSON.parse(sw);
                    return swidget;
                } catch (err) {
                    console.dir(sw);
                    return sw;
                }
            });
            that.socialWidgets = socialWidgetsSource.map(d => new SocialWidgetBase(<any>objectWithoutProperties(d, ['__typename'])));
        }
    }

    private _processChartYAxisFormatterFunctions(definition: any) {
        if (definition.yAxis && definition.yAxis.labels && definition.yAxis.labels.formatter) {
            const formatterFactory = new FormatterFactory();
            definition.yAxis.labels.formatter = formatterFactory.getFormatter(definition.yAxis.labels.formatter).exec;
        }
        return definition;
    }

    private _processChartTooltipFormatter(definition: any) {
        if (definition.tooltip && definition.tooltip.formatter) {
            const formatterFactory = new FormatterFactory();
            const formatterType = Object.prototype.toString.call(definition.tooltip.formatter);

            let formatter;
            if (formatterType !== '[object Function]') {

                formatter = formatterFactory.getFormatter(
                    definition.tooltip.formatter);
            } else {

                formatter = definition.tooltip.formatter;
            }

            if (!formatter) {
                console.error('Formatter for ' + definition.tooltip.formatter + ' could not be found');
            } else {
                definition.tooltip.formatter = formatter.exec;
            }
        } else {

            if (definition.tooltip && definition.tooltip.custom) {
                const formatterFactory = new FormatterFactory();
                const formattercustom = formatterFactory.getFormatter(
                    definition.tooltip.custom
                );
                definition.tooltip.formatter = formattercustom.exec;

            }

            const targetExists = definition.series.find(s => s.targetId);
            if (definition.tooltip && definition.tooltip.altas_definition_id === 'default' && targetExists) {
                const formatterFactory = new FormatterFactory();
                const formatter = formatterFactory.getFormatter('percentage_target_default').exec;
                definition.tooltip.pointFormatter = formatter;
            }

        }
        return definition;

    }

    private _processPieChartPercent(definition: any) {
        // if (definition.plotOptions && definition.plotOptions.pie) {
        //     const formatterFactory = new FormatterFactory();
        //     definition.plotOptions.pie.dataLabels.formatter =
        //         formatterFactory.getFormatter(definition.plotOptions.pie.dataLabels.formatter).exec;
        // }
        return definition;
    }

    private _dateRangesQuery() {
        const that = this;
        this._apollo.query<{ dateRanges: IDateRangeItem[] }>({
            query: chartsGraphqlActions.dateRanges,
            fetchPolicy: 'network-only'
        })
            .toPromise()
            .then((res) => that.dateRanges = res.data.dateRanges);
    }

    private _bringMapMarkers() {
        const that = this;
        this._subscription.push(this._apolloService.networkQuery(mapMarkersQuery).then(res => {
            that.mapMarkers = res.mapMarkers.map(m => objectWithoutProperties(m, ['__typename']));
            const payLoad: any = this.dashboardPayLoad;
            this.showMap = this.mapMarkers && this.mapMarkers.length > 0 && payLoad && payLoad.maps.length > 0;
        }));
    }

    private _getSocialWidgets() {
        const that = this;

        this._apolloService.networkQuery(socialWidgetQuery).then(res => {
            const socialWidgets = res.listSocialWidgets.map(d => new SocialWidgetBase(<any>objectWithoutProperties(d, ['__typename'])));
            // this.socialWidgets = socialWidgets;
        });
    }

    viewChart() {
        return this._userService.hasPermission('View', 'Chart') ||
            (this._rawDashboard && this._rawDashboard.users.includes(this._userService.user._id));
    }

    private chartIdValues(dataDashboard) {
            const charts: string[] = [];

            if (dataDashboard.dashboard.charts) {
                dataDashboard.dashboard.charts.forEach(item => {
                    charts.push(JSON.parse(item)._id); });
                return charts;
            }
            return;
    }

    delChartId(result): void {
        const idChart = result.idChart;

        this._dashboardQuery.refetch({
            id: result.idDashboard

        }).then(res => {
            const that = this;
            const value = res.data;
            const chartValues = this.chartIdValues(value).filter(c => c !== idChart);

            const resultChartValues = {
                    charts: chartValues
            } as any;

            if (value.dashboard._id) {
                resultChartValues.id = result.idDashboard;
            }
            this._apolloService.mutation < DashboardResponse > (dashboardGraphqlActions.deleteChartIdFromDashboard, resultChartValues)
                .then(res => {
                    // that.ngOnInit();
                    that._loadDashboard(value.dashboard._id);
            })
                .catch(err => that._displayServerErrors(err));
        });
    }

    private _displayServerErrors(err) {
        console.log('Server errors: ' + JSON.stringify(err));
    }

    editingChartFromDashboard($event) {
        if (!this.modifyChartActivity.check(this._userService.user)) {
            this._router.navigateByUrl('/unauthorized');
        } else {
        this.isEditChartFromDashboard = true;
        this.idChartSelected = $event;
        }
    }
    showDashboardShow($event) {
        this.isEditChartFromDashboard = false;
        this.ngOnInit();
    }

}
