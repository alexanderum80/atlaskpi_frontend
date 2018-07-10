import { AddConnectorActivity } from '../../shared/authorization/activities/data-sources/add-connector.activity';
import { Activity } from '../../shared/authorization/decorators/component-activity.decorator';
import { GoogleAnalyticsServerSideConnector } from './../shared/models/data-sources/google-analytics-server-side-connector';
import { CallRailComponent } from '../call-rail/call-rail.component';
import { CallRailsConnector } from '../shared/models/data-sources/callrails-connector';
import { TwitterServerSideConnector } from './../shared/models/data-sources/twitter-server-side-connector';
import { QuickBooksConnector } from './../shared/models/data-sources/quickbooks-online-connector';
import { SquareConnector } from '../shared/models/data-sources/square-connector';
import { Component, Input, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { environment } from './../../../environments/environment';
import {
    Router
} from '@angular/router';
import {
    ConnectorTypeEnum
} from '../shared/models/data-sources/connector-type-enum';
import {
    IOAuthConnector,
    OAuthConnector,
} from '../shared/models/data-sources/oauth-connector.base';
import {
    DataSourceService
} from '../shared/services/data-source.service/data-source.service';
import {
    IServerSideOAuthConnector,
    ServerSideOAuthConnector,
} from '../shared/models/data-sources/server-side-oauth-connector.base';
import { InstagramServerSideConnector } from '../shared/models/data-sources/instagram-server-side-connector';
import { LinkedInServerSideConnector } from '../shared/models/data-sources/linkedin-server-side-connector';
import { FacebookServerSideConnector } from '../shared/models/data-sources/facebook-server-side-connector';

@Activity(AddConnectorActivity)
@Component({
    selector: 'kpi-list-all-data-sources',
    templateUrl: './list-all-data-sources.component.pug',
    styleUrls: ['../shared/scss/data-sources.scss'],
    providers: [DataSourceService]
})
export class ListAllDataSourcesComponent implements OnInit, OnDestroy {
    @Input()
    public listAllDataSources: IOAuthConnector[];
    public allServerSideDataSources: IServerSideOAuthConnector[] = [];

    @ViewChild(CallRailComponent) callRailComponent: CallRailComponent;

    private _lsn: any;

    constructor(private _dataSourceService: DataSourceService,
        private _router: Router,
        private _renderer: Renderer2
    ) {
        this.allServerSideDataSources.push(new SquareConnector());
        this.allServerSideDataSources.push(new QuickBooksConnector());
        this.allServerSideDataSources.push(new FacebookServerSideConnector());
        this.allServerSideDataSources.push(new TwitterServerSideConnector());
        this.allServerSideDataSources.push(new InstagramServerSideConnector());
        this.allServerSideDataSources.push(new LinkedInServerSideConnector());
        this.allServerSideDataSources.push(new CallRailsConnector());

        this.allServerSideDataSources.push(new GoogleAnalyticsServerSideConnector());
    }

    ngOnInit() {
        this._getListAllDataSources();
        this._registerServerSideConnectorHook();
    }

    ngOnDestroy() {
        this._dataSourceService.unsubscribe();
    }

    // Get
    private _getListAllDataSources() {
        // this._dataSourceService.getListAllDataSources()
        //     .subscribe(
        //         (listDataSources: IOAuthConnector[]) => this.listAllDataSources = listDataSources
        //     );
    }

    public openListConnectedDataSources(): void {
        this._router.navigateByUrl('/datasource/listConnectedDataSourcesComponent');
    }

    // Other
    public tryConnectDataSource(dataSource: IOAuthConnector | IServerSideOAuthConnector): boolean {
        const width = 860;
        const height = 600;
        const left = (screen.width / 2) - (width / 2);
        const top = (screen.height / 2) - (height / 2);
        const windowOptions = `menubar=no,location=no,resizable=no,scrollbars=no,status=no,
                            width=${width}, height=${height}, top=${top}, left=${left}`;
        let url;

        if ((<any>dataSource)._name === 'CallRail') {
            // open callrail ui
            this.callRailComponent.open();
            return;
        }

        if (dataSource instanceof OAuthConnector) {
            url = dataSource.setUrlForAuthorize(this._getCurrentUrlHostname());
        }

        if (dataSource instanceof ServerSideOAuthConnector) {
            url = dataSource.getAuthorizeUri();
        }

        const win = window.open(url, 'auth', windowOptions);
        try {
            this._lsn();
        } catch (e) {;
        }

        if (dataSource instanceof OAuthConnector) {
            this._lsn = this._renderer.listen('window', 'OAuthCallback', (evt) => {
                this._globalOAuthCallbackListen(dataSource, evt);
            });
        }

        if (dataSource instanceof ServerSideOAuthConnector) {
            this._registerServerSideConnectorHook();
        }
        return true;
    }

    private _globalOAuthCallbackListen(dataSource: IOAuthConnector, evt: any) {
        this._lsn();
        if (!dataSource.validateRedirect(evt.detail)) {
            return;
        }
        this._lsn = this._renderer.listen('window', 'AddedDataSourceCallback',
            (evt) => {
                this._addedDataSourceCallback(evt);
            });
        this._dataSourceService.addDataSourceToListConnected(dataSource);
        this.openListConnectedDataSources();
    }

    private _addedDataSourceCallback(evt: any) {
        this._lsn();
        this._dataSourceService.addedDataSourceCallback$Service(evt);
    }

    private _getCurrentUrlHostname(): string {
        return window.location.origin;
    }

    private _registerServerSideConnectorHook(): void {
        window.addEventListener('message', (event) => {
            // IMPORTANT: Check the origin of the data!
            if (~environment.integrationUrl.indexOf(event.origin) && event.data.messageSource === 'atlasKPIIntegrations') {
                // The data has been sent from your site
                this.openListConnectedDataSources();
                // The data sent with postMessage is stored in event.data
                console.log(event.data);
            } else {
                // The data hasn't been sent from your site!
                // Be careful! Do not use it.
                return;
            }
        });
    }
}

