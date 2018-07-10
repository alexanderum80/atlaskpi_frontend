import {
    ConnectorTypeEnum
} from './connector-type-enum';
import { ServerSideOAuthConnector, IServerSideOAuthConnector } from './server-side-oauth-connector.base';


export class CallRailsConnector extends ServerSideOAuthConnector {
    constructor() {
        super();
        this._appId = '';
        this._name = 'CallRail';
        this._typeDataSource = ConnectorTypeEnum.CallRail;
        this._scope = '';
        this._authorizeUri = '';
    }
}
