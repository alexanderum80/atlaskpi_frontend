import { Currency } from '../models';
import { ApiService } from './api.service';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class CurrenciesService {

    private _basePath = '/data/currencies/';

    constructor(private api: ApiService) { }

    getCurrency(): Observable<Currency[]> {
       return this.api.get(this._basePath, 'currencies.json')
                  .map(currencies => currencies.map(c => new Currency(c)));
    }
}

