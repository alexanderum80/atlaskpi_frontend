import { ServerSideOAuthConnector, IServerSideOAuthConnector } from './server-side-oauth-connector.base';
import {
    ConnectorTypeEnum
} from './connector-type-enum';

export class InstagramServerSideConnector extends ServerSideOAuthConnector  implements IServerSideOAuthConnector {
    constructor() {
        super();
        this._appId = '25ee1b10184a47e797939fdb6159451f';
        this._name = 'Instagram ServerSide';
        this._typeDataSource = ConnectorTypeEnum.InstagramServerSide;
        this._scope = 'basic';
        this._authorizeUri = 'https://api.instagram.com/oauth/authorize/?client_id={appId}&redirect_uri={redirectUri}&' +
                             'scope={scope}&response_type=code&state={connectorId}:{hostname}';
    }

    public getDisconnectButtonTitle(): string {
        return 'Delete';
    }
}

