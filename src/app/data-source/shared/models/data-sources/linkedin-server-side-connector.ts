import { ServerSideOAuthConnector, IServerSideOAuthConnector } from './server-side-oauth-connector.base';
import {
    ConnectorTypeEnum
} from './connector-type-enum';

export class LinkedInServerSideConnector extends ServerSideOAuthConnector  implements IServerSideOAuthConnector {
    constructor() {
        super();
        this._appId = '77d6mvozywlede';
        this._name = 'LinkedIn';
        this._typeDataSource = ConnectorTypeEnum.LinkedIn;
        this._scope = 'r_basicprofile r_emailaddress rw_company_admin';
        this._authorizeUri = 'https://www.linkedin.com/oauth/v2/authorization?client_id={appId}&redirect_uri={redirectUri}&' +
                             'scope={scope}&response_type=code&state={connectorId}:{hostname}';
    }

    public getDisconnectButtonTitle(): string {
        return 'Delete';
    }
}

