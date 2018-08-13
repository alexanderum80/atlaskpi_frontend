import { QuickBooksConnector } from './quickbooks-online-connector';
import {
    ConnectorTypeEnum
} from './connector-type-enum';

import {
    environment
} from '../../../../../environments/environment';
import { getHostname } from '../../../../shared/extentions';

export function getConnectorId(type: ConnectorTypeEnum): string {
    switch (type) {
        case ConnectorTypeEnum.QuickBooksOnline:
            return 'qbo';
        case ConnectorTypeEnum.Square:
            return 'square';
        case ConnectorTypeEnum.InstagramServerSide:
            return 'instagram';
        case ConnectorTypeEnum.LinkedIn:
            return 'linkedin';
        case ConnectorTypeEnum.FacebookServerSide:
            return 'facebook';
        case ConnectorTypeEnum.GoogleAnalyticsServerSide:
            return 'googleanalytics';


        case ConnectorTypeEnum.TwitterServerSide:
            return 'twitter';

        default:
            return;
    }
}

export function getConnectorType(type: string): ConnectorTypeEnum {
    switch (type) {
        case 'qbo':
            return ConnectorTypeEnum.QuickBooksOnline;
        case 'square':
            return ConnectorTypeEnum.Square;
        case 'instagram':
            return ConnectorTypeEnum.InstagramServerSide;
        case 'linkedin':
            return ConnectorTypeEnum.LinkedIn;
        case 'facebook':
            return ConnectorTypeEnum.FacebookServerSide;
        case 'twitter':
            return ConnectorTypeEnum.TwitterServerSide;
        case 'googleanalytics':
            return ConnectorTypeEnum.GoogleAnalyticsServerSide;
        case 'callrail':
            return ConnectorTypeEnum.CallRail;
        default:
            return;
    }
}



export interface IServerSideOAuthConnector {
    // Get
    getId(): string;
    getType(): ConnectorTypeEnum;
    getTypeString(): string;
    getUrlMainImage(): string;
    getName(): string;
    getAuthorizeUri(): string;
    getRedirectUri ? (): string;
    getAuthService ? (): any;
    getCurrentHostname ?(): string;
    getDisconnectButtonTitle(): string;
    // Set
    setName?(name: string): void;

    isEnabled ? (): boolean;
    isAuthorized ? (): boolean;
}


export class ServerSideOAuthConnector implements IServerSideOAuthConnector {
    // Properties
    protected _id: string;
    protected _active = true;
    protected _isAuthorized = false;
    protected _urlMainImage = '/assets/img/datasources/{typeDataSource}.DataSource.MainImage.png';
    protected _name = 'no name';
    protected _urlUserImage = './assets/img/datasources/default.UserImage.png'; // default user's image
    protected _typeDataSource: ConnectorTypeEnum;
    protected _appId: string;
    protected _authorizeUri: string;
    protected _scope: string;

    constructor() {}

    // Set
    public setId(id: string): void {
        this._id = id;
    }

    public setName(name: string): void {
        this._name = name;
    }

    public setActive(active: boolean): void {
        this._active = active;
    }

    // Get
    public getId(): string {
        return this._id;
    }

    public getType(): ConnectorTypeEnum {
        return this._typeDataSource;
    }

    public getTypeString(): string {
        return ConnectorTypeEnum[this.getType()].toString();
    }

    public getUrlMainImage(): string {
        return this._urlMainImage.replace('{typeDataSource}', this.getTypeString());
    }

    public getName(): string {
        return this._name;
    }

    public getAuthorizeUri(): string {
        return this ._authorizeUri
                    .replace('{appId}', this._appId)
                    .replace('{redirectUri}', this.getRedirectUri())
                    .replace('{scope}', this.getScope())
                    .replace('{connectorId}', getConnectorId(this.getType()))
                    .replace('{hostname}', getHostname());
    }

    public getRedirectUri() { return environment.integrationUrl; }

    public getScope(): string {
        return this._scope;
    }

    public getDisconnectButtonTitle(): string {
        return 'Delete';
    }

    public getActive(): boolean {
        return this._active;
    }

}
