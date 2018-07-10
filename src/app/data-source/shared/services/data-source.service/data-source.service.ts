import 'rxjs/add/observable/of';

import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import SweetAlert from 'sweetalert2';

import { CommonService } from '../../../../shared/services/common.service';
import { ConnectorTypeEnum } from '../../models/data-sources/connector-type-enum';
import { FacebookConnector } from '../../models/data-sources/facebook-connector';
import { GoogleAnaliticsConnector } from '../../models/data-sources/google-analitics-connector';
import { InstagramConnector } from '../../models/data-sources/instagram-connector';
import { IOAuthConnector } from '../../models/data-sources/oauth-connector.base';
import { TwitterConnector } from '../../models/data-sources/twitter-connector';
import { YoutubeConnector } from '../../models/data-sources/youtube-connector';
import { FacebookAuthService } from '../data-source-auth.services/facebook-auth.service';
import { GoogleAnaliticsAuthService } from '../data-source-auth.services/google-analitics-auth.service';
import { InstagramAuthService } from '../data-source-auth.services/instagram-auth.service';
import { TwitterAuthService } from '../data-source-auth.services/twitter-auth.service';
import { YoutubeAuthService } from '../data-source-auth.services/youtube-auth.service';

// OAuthConnector's services
@Injectable()
export class DataSourceService {
    private _listAllDataSources: IOAuthConnector[];
    private _listConnectedDataSources: IOAuthConnector[];

    private _subscription: Subscription[] = [];
    constructor(private _http: Http,
        private _apollo: Apollo,
        private _facebookAuthService: FacebookAuthService,
        private _instagramAuthService: InstagramAuthService,
        private _twitterAuthService: TwitterAuthService,
        private _youtubeAuthService: YoutubeAuthService,
        private _googleAnaliticsAuthService: GoogleAnaliticsAuthService
    ) {
        this._getGarbageForInit();
        this._setSubscriptions([
            ...this._facebookAuthService.subscriptions,
            ...this._instagramAuthService.subscriptions,
            ...this._youtubeAuthService.subscriptions,
            ...this._googleAnaliticsAuthService.subscriptions
        ]);
    }

    public unsubscribe(): void {
        CommonService.unsubscribe(this._subscription);
    }

    public getListAllDataSources(): Observable < IOAuthConnector[] > {
        return Observable.of(this._listAllDataSources);
    }

    public getListConnectedDataSources(): Observable < IOAuthConnector[] > {
        return Observable.of(this._listConnectedDataSources);
    }

    public deleteDataSourceFromListConnected(dataSource: IOAuthConnector): Observable < IOAuthConnector[] > {
        // http.delete(dataSpurce)...
        const index = this._listConnectedDataSources.findIndex(x => x === dataSource);
        if (index > -1) {
            this._listConnectedDataSources.splice(index, 1);
        } else {
            // console.log('#dsgjkd Error');
        }
        return this.getListConnectedDataSources();
    }

    public addDataSourceToListConnected(dataSource: IOAuthConnector): void {
        const newDataSource: IOAuthConnector = this._createDataSource(dataSource.getType());
        newDataSource.moveRegData(dataSource);
        // http.post(dataSource)
        newDataSource.connect();
    }

    public isConnectedAccount(dataSource: IOAuthConnector): boolean {
        return this._listConnectedDataSources
            .findIndex((a: IOAuthConnector, index: number) =>
                a.getType() === dataSource.getType() && a.getUserId() === dataSource.getUserId()) > -1;
    }

    public addedDataSourceCallback$Service(evt: CustomEventInit): void {
        const dataSource: IOAuthConnector = evt.detail.dataSource;

        if (evt.detail.state === true) {
            if (this.isConnectedAccount(dataSource)) {
                SweetAlert({
                    title: 'Dublicate Data Source',
                    text: dataSource.getTypeString() + ' account of ' + dataSource.getUserLogin() + ' has added',
                    type: 'error'
                });
            } else {
               this._listConnectedDataSources.push(dataSource);
            }
        } else {
               SweetAlert({
                title: 'Error connection account',
                text: 'No ' + dataSource.getTypeString() + ' account',
                type: 'error'
            });
        }
    }

    // Other
    private _createDataSource(connectorTypeEnum: ConnectorTypeEnum): IOAuthConnector {
        let dataSource: IOAuthConnector;
        switch (connectorTypeEnum) {
            case ConnectorTypeEnum.Facebook:
                dataSource = new FacebookConnector();
                dataSource.setAuthService(this._facebookAuthService);
                break;
            case ConnectorTypeEnum.Instagram:
                dataSource = new InstagramConnector();
                dataSource.setAuthService(this._instagramAuthService);
                break;
            case ConnectorTypeEnum.Twitter:
                dataSource = new TwitterConnector();
                dataSource.setAuthService(this._twitterAuthService);
                break;
            case ConnectorTypeEnum.Youtube:
                dataSource = new YoutubeConnector();
                dataSource.setAuthService(this._youtubeAuthService);
                break;
            case ConnectorTypeEnum.GoogleAnalitics:
                dataSource = new GoogleAnaliticsConnector();
                dataSource.setAuthService(this._googleAnaliticsAuthService);
                break;
    }
        return dataSource;
    }

    private _loadCredentianalsForDataSource(dataSource: IOAuthConnector): IOAuthConnector {
        dataSource.setUrlUserImage('https://scontent.xx.fbcdn.net/v/t1.0-1/p50x50/22279389_107851936639248_5242337157068329662_n.jpg?oh=dc6337d882bad0777c563c86e8603671&oe=5A86C3F5');
        dataSource.setUserLogin('Alice Tensel');
        dataSource.setUserId('118567568901018');
        dataSource.setAuthorized();

        return dataSource;
    }

    // Gets
    private _getGarbageForInit() {
        this._listAllDataSources = [];
        this._listAllDataSources.push(this._createDataSource(ConnectorTypeEnum.Facebook));
            // this._listAllDataSources.push(this._createDataSource(ConnectorTypeEnum.Instagram));
            // this._listAllDataSources.push(this._createDataSource(ConnectorTypeEnum.Twitter));
        this._listAllDataSources.push(this._createDataSource(ConnectorTypeEnum.Youtube));
        this._listAllDataSources.push(this._createDataSource(ConnectorTypeEnum.GoogleAnalitics));
        this._listConnectedDataSources = [];
        // this._listConnectedDataSources.push(this._loadCredentianalsForDataSource(
        //         this._createDataSource(ConnectorTypeEnum.Facebook)
        //     ));
    }

    private _setSubscriptions(subscriptions: Subscription[]): void {
        if (!subscriptions || !subscriptions.length) { return; }

        this._subscription = this._subscription.concat(subscriptions);
    }

}
