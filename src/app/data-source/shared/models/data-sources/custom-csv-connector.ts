import {
    ConnectorTypeEnum
} from './connector-type-enum';
import { ServerSideOAuthConnector, IServerSideOAuthConnector } from './server-side-oauth-connector.base';


export class CustomCSVConnector extends ServerSideOAuthConnector {
    constructor() {
        super();
        this._appId = '';
        this._name = 'CustomCSV';
        this._typeDataSource = ConnectorTypeEnum.CustomCSV;
        this._scope = '';
        this._authorizeUri = '';
    }
}
