import { IMutationError, IMutationResponse } from '../../shared/interfaces/mutation-response.interface';
import { AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Apollo, QueryRef } from 'apollo-angular';
import { ApolloQueryResult } from 'apollo-client';
import { uniq, isEmpty } from 'lodash';
import { Subscription } from 'rxjs/Subscription';
import Sweetalert from 'sweetalert2';

import { DashboardService } from '..';
import { ChartModel } from '../../charts/shared';
import { IChart, ListChartsQueryResponse } from '../../charts/shared/models/chart.models';
import { ModalComponent, SelectionItem } from '../../ng-material-components';
import { DialogResult } from '../../shared/models/dialog-result';
import { ApolloService } from '../../shared/services/apollo.service';
import { BrowserService } from '../../shared/services/browser.service';
import { GenericSelectionService } from '../../shared/services/generic-selection.service';
import { usersApi } from '../../users/shared/graphqlActions/userActions';
import { widgetsGraphqlActions } from '../../widgets/shared/graphql/widgets.graphql-actions';
import { ListWidgetsQueryResponse } from '../../widgets/shared/models';
import { dashboardGraphqlActions } from '../shared/graphql';
import { Dashboard, IDashboard } from '../shared/models';
import { MenuService } from '../shared/services';
import { IUserInfo } from '../../shared/models/user';
import { GenericSelectionItem, IGenericSelectionItem } from '../../shared/services/generic-selection.service';
import { UserService } from '../../shared/services/user.service';
import { IWidget, WidgetSizeEnum, WidgetSizeMap } from '../../widgets/shared/models/widget.models';

const dashboardByNameQuery = require('graphql-tag/loader!../shared/graphql/dashboard-by-name.gql');

@Component({
  selector: 'kpi-dashboard-form',
  templateUrl: './dashboard-form.component.pug',
  styleUrls: ['./dashboard-form.component.scss'],
  providers: [MenuService, GenericSelectionService]
})
export class DashboardFormComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('modal') modal: ModalComponent;
  @ViewChild('errorModal') errorModal: ModalComponent;
  @Input() fg: FormGroup;
  @Input() actionAdd: null;

  dashboardModel: IDashboard = null;
  dashboardPayload: IDashboard = null;
  formTitle = 'Create Dashboard';

  chartModel: ChartModel;

  widgetsLoading = true;
  chartsLoading = true;

  allWidgets: IWidget[] = [];
  allCharts: IChart[] = [];

  filterList: SelectionItem[] = [];
  allUsers: SelectionItem[] = [];

  selectedTab = 'widgets';

  // modal definitions
  modalTitle: string = null;
  modalBody: string = null;
  modalAlert = false;
  modalButtonTitle: string = null;

  Info = false;
  ChartIn = true;

  selectedItems: IGenericSelectionItem[] = [];

  subscriptions: Subscription[] = [];

  isMobile: boolean;

  isAccessLevelsTab = false;
  isAddChart = false;
  isAddWidget = false;
  isPreviewDashboard = false;

  loading = false;
  currentUser: IUserInfo;
  rawDashboard: IDashboard;
  dashboardId: string;
  chartGroupList: SelectionItem[] = [];
  previewDashboardModel: IDashboard;

  errorMessage: string;

  private _filteredVisibleCharts: IChart[] = [];

  constructor(private _apollo: Apollo, private _apolloService: ApolloService, private _router: Router,
              private _routeActivited: ActivatedRoute, private _dashboardService: DashboardService,
              private _serviceMenu: MenuService, private _selectionService: GenericSelectionService,
              private _browserSerivce: BrowserService, private _fb: FormBuilder,
              private _userService: UserService) {
              this.isMobile = _browserSerivce.isMobile();
  }

  ngOnInit() {
    const that = this;

    this.subscriptions.push(this._userService.user$.subscribe((user: IUserInfo) => {
      that.currentUser = user;
    }));

    this._selectionService.enableMultiSelect();
    this.subscriptions.push(this._selectionService.selection$.subscribe(selectedItems => {
      that.selectedItems = selectedItems;
    }));

    if ( that.actionAdd === 'actionAdd' ) {
      that._loadUsers();
      that._loadWidgets();
      that._loadCharts();
      that._dashboardModelSubscription();
    } else {
      this.updateFormTitle();
      this._loadDashboard().then(() => {
        that._loadUsers();
        that._loadWidgets();
        that._loadCharts();
        that._dashboardModelSubscription();
      });
    }

    this.switchTab('widgets');

  }

  ngAfterViewInit() {
    this._dashboardService.updateExistDuplicatedName(false);
    this._subscribeToNameChanges();
    this._subscribeToFilterChanges();
    this._filterVisibleCharts();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => {
      if (s && !s.closed && (typeof s.unsubscribe === 'function')) {
        s.unsubscribe();
      }
    });
  }

  updateFormTitle() {
    this.formTitle = 'Modify Dashboard';
  }

  toggleWidgetSelection(item: any) {
    this._selectionService.toggleSelection(new GenericSelectionItem(item, 'widget'));
  }

  toggleChartSelection(item: any) {
    this._selectionService.toggleSelection(new GenericSelectionItem(item, 'chart'));
  }

  save() {
    if (this.selectedItems.length === 0) {
      this.openModal(true);
      return;
    }

    if (this.actionAdd === 'actionAdd') {
      this._actionAdd();
      return;
    }

    this._actionUpdate();
  }

  hastMutationErrorResponse(response: IMutationResponse): boolean {
    return response.errors && !isEmpty(response.errors[0]);
  }

  setErrorMessage(errors: IMutationError[]): void {
    this.errorMessage = 'Error occured';
    const mutationError = errors[0].errors;
    if (isEmpty(mutationError)) {
      return;
    }

    this.errorMessage = mutationError[0];
  }

  openErrorModal(errors: IMutationError[]): void {
    this.setErrorMessage(errors);
    this.errorModal.open();
  }

  deleteDashboard() {
    const that = this;

    this._apollo.mutate({
      mutation: dashboardGraphqlActions.deleteDashboard,
      variables: { id: this.dashboardModel._id },
      refetchQueries: ['Dashboards', 'allDashboard', 'idNameDashboardList']
    })
      .subscribe((response: ApolloQueryResult<any>) => {
        const dashboardResponse = response.data.deleteDashboard;
        if (that.hastMutationErrorResponse(dashboardResponse)) {
          that.openErrorModal(dashboardResponse.errors);
      } else {
        this.modal.dismiss();
      }
    });
  }

  // Modal actions

  openModal(modalAlert: boolean) {
    this.modalAlert = modalAlert;
    if (modalAlert) {
      this.modalTitle = 'Error saving dashboard';
      this.modalBody = 'You should select at least 1 element in order to save a dashboard.';
      this.modalButtonTitle = 'OK';
    } else {
      this.modalTitle = 'Confirmation';
      this.modalBody = 'Do you want to delete this Dashbaord?';
      this.modalButtonTitle = 'CANCEL';
    }
    this.modal.open();
  }

  openedModal() {
  }

  closedModal() {
    this.deleteDashboard();
    this.modal.dismiss();
    window.history.back();
  }

  closeErrorModal(): void {
    if (this.errorModal) {
      this.errorModal.close();
    }
  }

  dismissedModal() {
    this.modal.dismiss();
  }

  cancel() {
    this._router.navigateByUrl('/dashboards/list');
  }

  private _loadWidgets(options = { updateSelection: true }) {
    this.widgetsLoading = true;
    const that = this;
    this._apollo.query<ListWidgetsQueryResponse> ({
      query: widgetsGraphqlActions.listWidgetsNoData,
      variables: { materialize: false },
      fetchPolicy: 'network-only'
    })
    .toPromise()
    .then(response => {
      that.widgetsLoading = false;
      that.allWidgets = response.data.listWidgets;
      if (options.updateSelection) {  that._updateWidgetSelection(); }
    });
  }

  private _loadCharts(options = { updateSelection: true }): Promise<any> {
    this.chartsLoading = true;
    const that = this;

    return new Promise((resolve, reject) => {
      that._apollo.query<ListChartsQueryResponse>({
        query: dashboardGraphqlActions.listCharts,
        fetchPolicy: 'network-only'
      })
      .toPromise()
      .then((response => {
        that.allCharts = response.data.listCharts.data;
        that.chartsLoading = false;
        that._groupCharts();
        if (options.updateSelection) {  that._updateChartSelection(); }
        this._filterVisibleCharts();
        return resolve();
      }));
    });
  }

  private _groupCharts() {
    const groups = uniq(this.allCharts.map(c => {
      if (!c.group) { return; }
      return c.group;
    }));
    this.chartGroupList = groups.map(g => new SelectionItem(g, g));
    this.filterList = this.chartGroupList;
  }

  previewDashboard() {
    const that = this;
    this.loading = true;

    const payload = {
      name: that.dashboardModel ? that.dashboardModel.name : '',
      description: that.dashboardModel ? that.dashboardModel.description : '',
      charts: that.selectedCharts.map((c: IChart) => c._id),
      widgets: that.selectedWidgets.map((w: IWidget) => w._id),
    };

    that._apolloService.networkQuery(
      dashboardGraphqlActions.previewDashboard,
      { input: payload }
    )
    .then((res: { previewDashboard: IDashboard }) => {
      that.dashboardPayload = res.previewDashboard;
      that.loading = false;
      that.isPreviewDashboard = true;
    });
  }

  exitPreview() {
    this.isPreviewDashboard = false;
  }

  private _actionAdd() {
    const that = this;

    this._dashboardService.updateExistDuplicatedName(false);

    this._apolloService.networkQuery < IDashboard > (dashboardByNameQuery, { name: this.fg.controls['name'].value }).then(d => {
      if (d.dashboardByName) {

          this._dashboardService.updateExistDuplicatedName(true);

          this.fg.controls['name'].setErrors({forbiddenName: true});

          return Sweetalert({
              title: 'Duplicated name!',
              text: 'You already have a Dashboard with that name. Please change the name and try again.',
              type: 'error',
              showConfirmButton: true,
              confirmButtonText: 'Ok'
          });
      }
      const dashboardPayload = {
        name: that.dashboardModel.name.trim(),
        description: that.dashboardModel.description,
        charts: that.selectedCharts.map((c: IChart) => c._id),
        widgets: that.selectedWidgets.map((w: IWidget) => w._id),
        users: that.dashboardModel.users,
        owner: that.currentUser._id
      };

      this._apollo.mutate({
        mutation: dashboardGraphqlActions.createDashboard,
        variables: { input: dashboardPayload },
        refetchQueries: ['Dashboards', 'allDashboard', 'idNameDashboardList']
        }).subscribe((response: ApolloQueryResult < any > ) => {
          const res = response.data.createDashboard;
          if (!res.success && that.hastMutationErrorResponse(res)) {
              that.openErrorModal(res.errors);
          } else {
              that._router.navigateByUrl('/dashboards/list');
          }
      });
    });
  }

  private _actionUpdate() {
    const that = this;

    this._dashboardService.updateExistDuplicatedName(false);

    this._apolloService.networkQuery < IDashboard > (dashboardByNameQuery, { name: this.fg.controls['name'].value }).then(d => {
      if (d.dashboardByName && d.dashboardByName._id !== this.dashboardId) {

          this._dashboardService.updateExistDuplicatedName(true);

          this.fg.controls['name'].setErrors({forbiddenName: true});

          return Sweetalert({
              title: 'Duplicated name!',
              text: 'You already have a Dashboard with that name. Please change the name and try again.',
              type: 'error',
              showConfirmButton: true,
              confirmButtonText: 'Ok'
          });
      }

      const dashboardPayload = {
        name: that.dashboardModel.name.trim(),
        description: that.dashboardModel.description,
        charts: that.selectedCharts.map((c: IChart) => c._id),
        widgets: that.selectedWidgets.map((w: IWidget) => w._id),
        users: that.dashboardModel.users
      };

      this._apollo.mutate({
        mutation: dashboardGraphqlActions.updateDashboard,
        variables: { id: this.dashboardId, input: dashboardPayload },
        refetchQueries: ['Dashboards', 'allDashboard', 'idNameDashboardList']
      }).subscribe((response: ApolloQueryResult < any > ) => {
        const res = response.data.updateDashboard;

        if (!res.success && that.hastMutationErrorResponse(res)) {
          that.openErrorModal(res.errors);
        } else {
            that._router.navigateByUrl('/dashboards/list');
        }
      });
    });
  }

  private _dashboardModelSubscription() {
    const that = this;
    // const selectedCharts = uniq(this.chartsSelected);
    this.subscriptions.push(this.fg.valueChanges
    .debounceTime(200)
    .distinctUntilChanged()
    .subscribe(dashboard => {
      that.dashboardModel = Dashboard.Create(
          null,
          dashboard.name,
          dashboard.description,
          this.selectedCharts.map((c: IChart) => c._id),
          this.selectedWidgets.map((w: IWidget) => w._id),
          that.dashboardModel && that.dashboardModel.owner || that.currentUser._id,
          (dashboard.users.length > 0) && dashboard.users.split('|') || []
      );
    }));
  }

  private _loadDashboard(): Promise<any> {
    const that = this;
    this.dashboardId = this._routeActivited.params['_value'].id;

    return new Promise((resolve, reject) => {
        return <any>this._apollo.query<IDashboard>({
          query: dashboardGraphqlActions.dashboard,
          fetchPolicy: 'network-only',
          variables: {
            id: this.dashboardId
          }
        })
        .toPromise()
        .then((response: ApolloQueryResult < any > ) => {
          const rawDashboard = response.data.dashboard;

          const fgValues = {
            _id: rawDashboard._id,
            name: rawDashboard.name,
            description: rawDashboard.description,
            users: rawDashboard.users
          };

          that.dashboardModel = {
            name: rawDashboard.name,
            description: rawDashboard.description,
            charts: rawDashboard.charts.map(c => JSON.parse(c)._id),
            widgets: rawDashboard.charts.map(w => JSON.parse(w)._id),
            users: rawDashboard.users,
            owner: rawDashboard.owner
          };

          that.rawDashboard = rawDashboard;

          this.fg.patchValue(fgValues);
          return resolve();
      })
      .catch(err => {
        console.log('error loading dashboard. ', err);
        resolve();
      });
    });
  }

  private _loadUsers() {
    const that = this;
    this._apollo.query({
      query: usersApi.all,
      fetchPolicy: 'network-only'
    })
    .toPromise()
    .then(({ data }) => {
        that.allUsers = (<any>data).allUsers
          .filter(u => !that._isAccountOwner(u) && !that._isDashboardOwner(u))
          .map(user => {
            return new SelectionItem(
            user._id,
            (user.profile.firstName) ?
            user.profile.firstName + ' ' + user.profile.lastName
            : user.username,
            that.dashboardModel && that.dashboardModel.users.includes(user._id)
           );
         });
    })
    .catch(err => {
      console.log('error loading users ', err);
    });
  }

  private _isAccountOwner(user): boolean {
    //return user.roles.find(role => role.name !== 'owner');
    return user && user.roles[0] && (user.roles[0].name === 'owner') ;
  }

  private _isDashboardOwner(user): boolean {
    const that = this;
    if (that.actionAdd === 'actionAdd') {
      return user._id === that.currentUser._id;
    }

    return user._id === (that.dashboardModel && that.dashboardModel.owner);
  }

  private _subscribeToFilterChanges() {
    this.subscriptions.push(
      this.fg.controls['filter'].valueChanges.subscribe(n => this._filterVisibleCharts())
    );
  }

  private _subscribeToNameChanges() {
    this.fg.controls['name'].valueChanges.subscribe(n => {
        if (n === '') {
            this.fg.controls['name'].setErrors({required: true});
        } else {
            if (this._dashboardService.getExistDuplicatedName() === true) {
              this._apolloService.networkQuery < IDashboard > (dashboardByNameQuery, { name: this.fg.controls['name'].value }).then(d => {
              if (d.dashboardByName && d.dashboardByName._id !== (this.dashboardId ? this.dashboardId : 0)) {
                    this.fg.controls['name'].setErrors({forbiddenName: true});
                  } else {
                    this.fg.controls['name'].setErrors(null);
                  }
              });
            }
        }
    });
  }

  switchTab(tab: string) {
    this.selectedTab = tab;
    const that = this;

    if (tab === 'charts' && !this.allCharts.length) {
      that._loadCharts().then(() => {
        // compose a list with the widgets in rawDashboard to mantain the reference on the selection service

        that.filterList = uniq(that.allCharts.filter(c => c.group).map(c => c.group))
                              .map(g => new SelectionItem(g, g));
      });
    }

    // this.fg.controls['filter'].setValue(null);
  }

  private _updateWidgetSelection() {
    if (!this.rawDashboard || !this.rawDashboard.widgets) { return; }
    const that = this;
    this.allWidgets.forEach(w => {
      const initialWidgetsSelection = (<any>that.rawDashboard.widgets).map(rw => JSON.parse(rw)._id);
      if (initialWidgetsSelection.includes(w._id)) {
        that.toggleWidgetSelection(w);
      }
    });
  }

  private _updateChartSelection() {
    if (!this.rawDashboard || !this.rawDashboard.charts) { return; }
    const that = this;
    this.allCharts.forEach(c => {
      const initialChartsSelection = (<any>that.rawDashboard.charts).map(rc => JSON.parse(rc)._id);
      if (initialChartsSelection.includes(c._id)) {
        that.toggleChartSelection(c);
      }
    });
  }

  private _filterVisibleCharts(): IChart[] {
    const filterValue = this.fg.get('filter').value;
    const groups = filterValue && filterValue.split('|') as string[] || [];

    if (!filterValue || !groups.length) {
      this._filteredVisibleCharts = this.allCharts;
      return;
    }

    this._filteredVisibleCharts = this.allCharts.filter(x => groups.includes(x.group));
  }


  openAddChart() {
    this.isAddChart = true;
  }

  openAddWidget() {
    this.isAddWidget = true;
  }

  onChartFormEvent($event: string) {
    this.isAddChart = false;
    this.selectedCharts.forEach(c => this.toggleChartSelection(c));
    this._loadCharts();
  }

  onWidgetFormEvent($event: string) {
    this.isAddWidget = false;
    this.selectedWidgets.forEach(c => this.toggleWidgetSelection(c));
    this._loadWidgets();
  }

  onDashboardPreviewFormEvent($event: DialogResult) {
    switch ($event) {
      case DialogResult.OK:

      break;
      case DialogResult.CANCEL:
        this.isPreviewDashboard = false;
        break;
    }
  }

  get isChartsTab(): boolean {
    return this.selectedTab === 'charts';
  }

  get isWidgetsTab(): boolean {
    return this.selectedTab === 'widgets';
  }

  get isAccessLevelTab(): boolean {
    return this.selectedTab === 'accessLevels';
  }

  get filterDisabled(): boolean {
    return this.isWidgetsTab || this.isAccessLevelsTab;
  }

  get selectedWidgets(): IWidget[] {
    return this.selectedItems.filter(i => i.type === 'widget').map(o => o.payload);
  }

  get selectedCharts(): IChart[] {
    return this.selectedItems.filter(i => i.type === 'chart').map(o => o.payload);
  }

  get visibleSmallWidgets(): IWidget[] {
    return this.allWidgets.filter(w => WidgetSizeMap[w.size] === WidgetSizeEnum.Small);
  }

  get visibleBigWidgets(): IWidget[] {
    return this.allWidgets.filter(w => WidgetSizeMap[w.size] === WidgetSizeEnum.Big);
  }

  get visibleCharts(): IChart[] {
    return this._filteredVisibleCharts;
  }

  get displayChart(): boolean {
    return this.isChartsTab;
  }

  get dashboardFormHidden() {
    return this.isAddChart || this.isAddWidget || this.isPreviewDashboard;
  }

  get valid(): boolean {
    return (this.fg.valid && this.selectedItems.length !== 0) &&
            this.validDashboardName;
  }

  get validDashboardName(): boolean {
    if (!this.fg) {
      return false;
    }

    return this.fg.value.name &&
          !this.dashboardNameContainsSpaceOnly &&
           this.dashboardNameMinLengthMet &&
           this.dashboardNameMaxLengthMet;
  }

  get dashboardNameMinLengthMet(): boolean {
    return this.fg.value.name.trim().length > 2;
  }
  get dashboardNameMaxLengthMet(): boolean {
    return this.fg.value.name.trim().length <= 25;
  }

  get dashboardNameContainsSpaceOnly(): boolean {
    const dashboardName: string = this.fg.value.name;
    const spaceOnly: RegExp = /^\s+$/;

    return spaceOnly.test(dashboardName);
  }

}
