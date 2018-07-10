import { ServerSideOAuthConnector, IServerSideOAuthConnector } from './server-side-oauth-connector.base';
import {
    ConnectorTypeEnum
} from './connector-type-enum';

export class GoogleAnalyticsServerSideConnector extends ServerSideOAuthConnector  implements IServerSideOAuthConnector {
    constructor() {
        super();
        this._appId = '565309196302-jlmh46olk33g6obgklv01u8sl4tau2aj.apps.googleusercontent.com';
        this._name = 'Google Analytics Server Side';
        this._typeDataSource = ConnectorTypeEnum.GoogleAnalyticsServerSide;
        this._scope = 'https://www.googleapis.com/auth/analytics.readonly';
        this._authorizeUri = 'https://accounts.google.com/o/oauth2/v2/auth?client_id={appId}&redirect_uri={redirectUri}&' +
                             'scope={scope}&response_type=code&state={connectorId}:{hostname}&prompt=consent&access_type=offline';
    }

    public getDisconnectButtonTitle(): string {
        return 'Delete';
    }
}

