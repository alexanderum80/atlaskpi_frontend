import { ServerSideOAuthConnector, IServerSideOAuthConnector } from './server-side-oauth-connector.base';
import {
    ConnectorTypeEnum
} from './connector-type-enum';

export class FacebookServerSideConnector extends ServerSideOAuthConnector  implements IServerSideOAuthConnector {
    constructor() {
        super();
        this._appId = '1960032350929896';
        this._name = 'Facebook Server Side';
        this._typeDataSource = ConnectorTypeEnum.FacebookServerSide;
        this._scope = 'pages_show_list read_insights';
        this._authorizeUri = 'https://www.facebook.com/v2.11/dialog/oauth?client_id={appId}&redirect_uri={redirectUri}&' +
                             'scope={scope}&response_type=code&state={connectorId}:{hostname}';
    }

    public getDisconnectButtonTitle(): string {
        return 'Delete';
    }
}

