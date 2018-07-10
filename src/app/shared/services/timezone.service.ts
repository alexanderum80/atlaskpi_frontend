import { Timezone } from '../models';
import { ApiService } from './api.service';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class TimezoneService {

    private _basePath = '/data/timezones/';

    constructor(private api: ApiService) { }

    getTimezones(): Observable<Timezone[]> {
       return this.api.get(this._basePath, 'timezones.json')
                  .map(timezone => timezone.map(t => new Timezone(t)));
    }
}
