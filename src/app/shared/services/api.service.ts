import { IQueryString } from '../models/query-string';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Headers, Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { objToQueryString, toJson } from '../extentions';

@Injectable()
export class ApiService {
  headers: Headers = new Headers({
    'Content-Type': 'application/json',
    Accept: 'application/json'
  });

  constructor(private http: Http, private router: Router) { }

  get(baseUrl: string, path: string, queryString?: IQueryString): Observable<any> {

    let url = `${baseUrl}${path}`;

    if (queryString) {
      url += `?${queryString.toQueryString()}`;
    }

    return this.http.get(url, { headers: this.headers })
      .map(this.checkForError)
      .catch(err => this.checkForUnauthorized(err))
      .map(toJson);
  }

  post(baseUrl: string, path: string, body, urlEncoded = false): Observable<any> {

    let payload = '';

    if (urlEncoded) {
      this.headers.set('Content-Type', 'application/x-www-form-urlencoded');
      payload = objToQueryString(body);
    } else if (typeof body === 'string') {
      payload = body;
    }  else {
      payload = JSON.stringify(body);
    }

    return this.http.post(
      `${baseUrl}${path}`,
      payload,
      { headers: this.headers }
    )
      .map(this.checkForError)
      .catch(err => this.checkForUnauthorized(err))
      .map(toJson);
  }

  delete(baseUrl: string, path, body?): Observable<any> {
    return this.http.delete(
      `${baseUrl}${path}`,
      { headers: this.headers, body: body }
    )
      .map(this.checkForError)
      .catch(err => this.checkForUnauthorized(err))
      .map(toJson);
  }

  patch(baseUrl: string, path: string, body, queryString?: IQueryString, urlEncoded = false): Observable<any> {

    let url = `${baseUrl}${path}`;

    if (queryString) {
      url += `?${queryString.toQueryString()}`;
    }

    let payload = '';

    if (typeof body === 'string') {
      payload = body;
    } else if (urlEncoded) {
      this.headers.set('Content-Type', 'application/x-www-form-urlencoded');
      payload = objToQueryString(body);
    } else {
      payload = JSON.stringify(body);
    }

    return this.http.patch(
      url,
      payload,
      { headers: this.headers }
    )
      .map(this.checkForError)
      .catch(err => this.checkForUnauthorized(err))
      .map(toJson);
  }

  setHeaders(headers) {
    Object.keys(headers).forEach(header => this.headers.set(header, headers[header]));
  }

  private checkForError(response: Response): Response | Observable<any> {
    if (response.status >= 200 && response.status < 300) {
      return response;
    } else {
      const error = new Error(response.statusText);
      error['response'] = response;
      console.error(error);
      throw error;
    }
  }

  private checkForUnauthorized(err: any) {
    if (err.status === 401) {
      this.router.navigate(['/start']);
    }
    return Observable.throw(err);
  }
}
