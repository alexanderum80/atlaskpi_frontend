import {
    ConnectorTypeEnum
} from './connector-type-enum';
import { ServerSideOAuthConnector, IServerSideOAuthConnector } from './server-side-oauth-connector.base';


export class CustomTableConnector extends ServerSideOAuthConnector {
    constructor() {
        super();
        this._appId = '';
        this._name = 'CustomTable';
        this._typeDataSource = ConnectorTypeEnum.CustomTable;
        this._scope = '';
        this._authorizeUri = '';
    }
}
