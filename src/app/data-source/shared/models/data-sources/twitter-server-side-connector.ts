import { ServerSideOAuthConnector, IServerSideOAuthConnector } from './server-side-oauth-connector.base';
import {
    ConnectorTypeEnum
} from './connector-type-enum';

import {
    environment
} from '../../../../../environments/environment';

export class TwitterServerSideConnector extends ServerSideOAuthConnector  implements IServerSideOAuthConnector {
    constructor() {
        super();
        this._appId = '1BWK6uAzS5Biim3wkKWeYQfKk';
        this._name = 'Twitter Server Side';
        this._typeDataSource = ConnectorTypeEnum.TwitterServerSide;
        this._authorizeUri = environment.twitterIntegrationUrl;

    }

    public getDisconnectButtonTitle(): string {
        return 'Delete';
    }
}

