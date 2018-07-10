import { Language } from '../models';
import { ApiService } from './api.service';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class LanguageService {

    private _basePath = '/data/languages/';

    constructor(private api: ApiService) { }

    getLanguages(): Observable<Language[]> {
       return this.api.get(this._basePath, 'languages.json')
                  .map(languages => languages.map(l => new Language(l)));
    }
}
