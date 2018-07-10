import { Observable } from 'rxjs/Observable';
import {
    Injectable
} from '@angular/core';
import {
    IServerSideOAuthConnector
} from '../../models/data-sources/server-side-oauth-connector.base';

@Injectable()
export class ServerSideDataSourceService {
    private _dataSources: IServerSideOAuthConnector[] = [];

    constructor() {
    }

    dataSources$(): Observable<IServerSideOAuthConnector[]> {
        return Observable.of(this._dataSources);
    }

    addDataSource(dataSource: IServerSideOAuthConnector): void {
        if (!dataSource) { return; }
        this._dataSources.push(dataSource);
    }

}
