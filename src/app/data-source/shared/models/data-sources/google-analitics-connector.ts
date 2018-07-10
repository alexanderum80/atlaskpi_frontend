import { IGoogleConnector, GoogleConnector } from './google-connector.base'
import { ConnectorTypeEnum } from './connector-type-enum'

export class GoogleAnaliticsConnector extends GoogleConnector{
    constructor() {
        super();
        this._titleDataSource = "Google Analitics";
        this._typeDataSource = ConnectorTypeEnum.GoogleAnalitics;
        this._scope = "https://www.googleapis.com/auth/analytics.readonly";  
        this._state = "state_parameter_passthrough_value";                    
        }
    }
