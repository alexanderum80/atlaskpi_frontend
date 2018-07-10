import { IServerSideOAuthConnector, ServerSideOAuthConnector } from './server-side-oauth-connector.base';
import { ConnectorTypeEnum } from './connector-type-enum';
import { OAuthConnector } from './oauth-connector.base';

export class SquareConnector extends ServerSideOAuthConnector implements IServerSideOAuthConnector {

    constructor() {
        super();
        this._name = 'Square';

        // clientId and clientSecret
        this._appId = 'sq0idp-_Ojf7lOc-mlVXV67a5MlPA';

        // scope for the api and the data source
        this._scope = 'MERCHANT_PROFILE_READ%20PAYMENTS_READ%20ORDERS_READ';
        this._typeDataSource = ConnectorTypeEnum.Square;

        // authorization url and url to get the token
        this._authorizeUri = `
        https://connect.squareup.com/oauth2/authorize?client_id=${this._appId}&scope=${this._scope}&state={connectorId}:{hostname}
        `;
    }

    getCallbackUrl(): string {
        return this._getCurrentUrl() + '/integration';
    }

    private _getCurrentHost(): string {
        return window.location.hostname.replace('.com', '');
    }

    private _getCurrentUrl(): string {
        return window.location.origin;
    }
}
