import { CommonService } from '../../shared/services/common.service';
import { AddConnectorActivity } from '../../shared/authorization/activities/data-sources/add-connector.activity';
import { ViewConnectorActivity } from '../../shared/authorization/activities/data-sources/view-connector.activity';
import { Activity } from '../../shared/authorization/decorators/component-activity.decorator';
import { DeleteConnectorActivity } from '../../shared/authorization/activities/data-sources/delete-connector.activity';
import { ListConnectedDataSourcesViewModel } from './list-connected-data-sources.viewmodel';
import { ServerSideConnectorFactory } from '../shared/models/data-sources/server-side-connector.factory';
import { ServerSideDataSourceService } from './../shared/services/data-source.service/server-side-data-sources.service';
import { IServerSideOAuthConnector, getConnectorType } from './../shared/models/data-sources/server-side-oauth-connector.base';
import {
  Component,
  OnInit,
  Input,
  Renderer2,
  ViewChild,
  OnDestroy
} from '@angular/core';
import {Router} from '@angular/router';
import { ConnectorTypeEnum } from '../shared/models/data-sources/connector-type-enum';
import {
  IOAuthConnector, OAuthConnector,
} from '../shared/models/data-sources/oauth-connector.base';
import { DataSourceService } from '../shared/services/data-source.service/data-source.service';
import { AutoUnsubscribe } from '../shared/auto-unsubscribe';
import { Apollo } from 'apollo-angular';
import SweetAlert from 'sweetalert2';
import { CallRailComponent } from '../call-rail/call-rail.component';
import { environment } from './../../../environments/environment';
import { Subscription } from 'rxjs/Subscription';

const ServerSideConnectorsQuery = require('graphql-tag/loader!./list-server-side-connectors.query.gql');
const RemoveServerSideConnectorQuery = require('graphql-tag/loader!./remove-server-side-connector.mutation.gql');

export interface IConnectorDetail {
  _id: string;
  name: string;
  active: boolean;
  type: string;
}

@Activity(ViewConnectorActivity)
@Component({
  selector: 'kpi-list-connected-data-sources',
  templateUrl: './list-connected-data-sources.component.pug',
  styleUrls: ['../shared/scss/data-sources.scss'],
  providers: [ListConnectedDataSourcesViewModel, AddConnectorActivity, DeleteConnectorActivity]
})
export class ListConnectedDataSourcesComponent implements OnInit, OnDestroy {
  @ViewChild(CallRailComponent) callRailComponent: CallRailComponent;


  public loading = true;
  public listConnectedDataSources: IOAuthConnector[];
  public listServerSideConnectedDataSources: IServerSideOAuthConnector[] = [];

  private _lsn: any;
  private _subscription: Subscription[] = [];

  constructor(private _dataSourceService: DataSourceService,
    private _router: Router,
    private _renderer: Renderer2,
    private _apollo: Apollo,
    public vm: ListConnectedDataSourcesViewModel,
    public deleteConnectorActivity: DeleteConnectorActivity,
    public addConnectorActivity: AddConnectorActivity
  ) { }

  ngOnInit() {
    this._getListConnectedDataSources();
    this._getServerSideDataSources();
    this.vm.addActivities([this.addConnectorActivity, this.deleteConnectorActivity]);
  }

  ngOnDestroy() {
    this._dataSourceService.unsubscribe();
    CommonService.unsubscribe(this._subscription);
  }

  public addDataSource() {                                 // Redirect to component to select new DataSource
    this._router.navigateByUrl('/datasource/listAllDataSourcesComponent');
  }

  public deleteDataSource(dataSource: IOAuthConnector) {         // Delete from list and from service
    this._subscription.push(
      this._dataSourceService.deleteDataSourceFromListConnected(dataSource)
        .subscribe((dataSources: IOAuthConnector[]) => this.listConnectedDataSources = dataSources)
    );
  }

  public removeServerSideConnector(dataSource: IServerSideOAuthConnector): void {
      SweetAlert({
        title: 'Are you sure you want to delete this data source?',
        type: 'warning',
        showConfirmButton: true,
        showCancelButton: true
      })
      .then(userResponse => {
        if (userResponse.value === true) {

          this._apollo.mutate<{removeConnector: { success: boolean }}>({
            mutation: RemoveServerSideConnectorQuery,
            variables: {
              id: dataSource.getId()
            },
            refetchQueries: ['ServerSideConnectors']
          }).subscribe(response => {
            if (response.data.removeConnector.success) {
              console.log('connector removed...');
            }
          });
        }
      });
  }

  private _getListConnectedDataSources() {                    // Load data from dataSourceService
    this._subscription.push(this._dataSourceService.getListConnectedDataSources()
      .subscribe(
          (dataSources: IOAuthConnector[]) => this.listConnectedDataSources = dataSources
        ));
  }

  private _getServerSideDataSources(): void {
    const that = this;
    this._subscription.push(
      this._apollo.watchQuery<{connectors: IConnectorDetail[]}>({
      query: ServerSideConnectorsQuery,
      fetchPolicy: 'network-only'
      })
      .valueChanges.subscribe(res => {
        that.listServerSideConnectedDataSources = that._mapConnectors(res.data.connectors) || [];
        this.loading = false;
      }));
  }

  private _mapConnectors(connectors: IConnectorDetail[]): IServerSideOAuthConnector[] {
    if (!connectors || !connectors.length) { return []; }
    return connectors.map(c => {
      const connector = ServerSideConnectorFactory.getInstance(c.type);
      connector.setId(c._id);
      connector.setName(c.name);
      connector.setActive(c.active);
      return connector;
    });
  }

  public reconnectDataSource(dataSource: IServerSideOAuthConnector): boolean {
    const width = 860;
    const height = 600;
    const left = (screen.width / 2) - (width / 2);
    const top = (screen.height / 2) - (height / 2);
    const windowOptions = `menubar=no,location=no,resizable=no,scrollbars=no,status=no,
                           width=${width}, height=${height}, top=${top}, left=${left}`;
    if ((<any>dataSource)._name === 'CallRail') {
        // open callrail ui
        this.callRailComponent.open();
        return;
    }

    const url = dataSource.getAuthorizeUri();

    this._registerServerSideConnectorHook();

    const win = window.open(url, 'auth', windowOptions);
    try {
        this._lsn();
    } catch (e) {;
    }
    return true;
}

  private _getCurrentUrlHostname(): string {
      return window.location.origin;
  }

  private _registerServerSideConnectorHook(): void {
      window.addEventListener('message', (event) => {
          // IMPORTANT: Check the origin of the data!
          if (~environment.integrationUrl.indexOf(event.origin) && event.data.messageSource === 'atlasKPIIntegrations') {
              // The data has been sent from your site
              this._getServerSideDataSources();
              // The data sent with postMessage is stored in event.data
            //   console.log(event.data);
          } else {
              // The data hasn't been sent from your site!
              // Be careful! Do not use it.
              return;
          }
      });
  }

  get serverSideDataSourcesEmpty(): boolean {
    return !this.loading && this.listServerSideConnectedDataSources.length === 0;
  }

}
