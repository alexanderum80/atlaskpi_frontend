import { ServerSideOAuthConnector, IServerSideOAuthConnector } from './server-side-oauth-connector.base';
import {
    IOAuthConnector,
    OAuthConnector
} from './oauth-connector.base';
import {
    ConnectorTypeEnum
} from './connector-type-enum';

export class QuickBooksConnector extends ServerSideOAuthConnector  implements IServerSideOAuthConnector {
    constructor() {
        super();
        // production
        this._appId = 'Q0To4ibGs5UUs0UfUhs0C79oalQiJ2bwZigEuZF3v3Opsrxt4Q';


        this._name = 'QuickBooks Online';
        this._typeDataSource = ConnectorTypeEnum.QuickBooksOnline;
        this._scope = 'com.intuit.quickbooks.accounting';
        this._authorizeUri = 'https://appcenter.intuit.com/connect/oauth2?client_id={appId}&redirect_uri={redirectUri}&' +
                             'scope={scope}&response_type=code&state={connectorId}:{hostname}';
    }

    public getDisconnectButtonTitle(): string {
        return 'Disconnect from Quickbooks';
    }
}

