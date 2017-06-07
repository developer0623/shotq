import { Http, URLSearchParams } from '@angular/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { ApiService } from '../api/api.service';

export type HTTP_METHODS = 'get'|'post'| 'put'| 'patch'| 'delete';

@Injectable()
export class RestClientService<T> {
  // TODO: define primary key explicitly
  public apiUrl: string = ``;
  public baseUrl: string;

  public static _getSearchParams(params): URLSearchParams {
    let res: URLSearchParams = new URLSearchParams();
    for (let k in params) {
      if (params.hasOwnProperty(k))
        res.set(k, params[k]);
    }

    return res;
  }

  constructor(public apiService: ApiService) {
  }

  _getListUrl(): string {
    return `${this.apiUrl}/${this.baseUrl}/`;
  }

  _getItemUrl(id): string {
    return `${this.apiUrl}/${this.baseUrl}/${id}/`;
  }

  getList(queryParams = {}) {
    return this.apiService.get(this._getListUrl(), null, RestClientService._getSearchParams(queryParams));
  }

  get(id, queryParams = {}): Observable<T> {
    return this.apiService.get(this._getItemUrl(id), null, RestClientService._getSearchParams(queryParams));
  }

  itemGet(id: number, action: string): Observable<any> {
    return this.apiService.get(`${this._getItemUrl(id)}${action}/`);
  }

  itemPost(id: number, action: string, data: {} = {}): Observable<any> {
    return this.apiService.post(`${this._getItemUrl(id)}${action}/`, data);
  }

  itemPatch(id: number, action: string, data: {} = {}): Observable<any> {
    return this.apiService.patch(`${this._getItemUrl(id)}${action}/`, data);
  }

  itemPut(id: number, action: string, data: {} = {}): Observable<any> {
    return this.apiService.put(`${this._getItemUrl(id)}${action}/`, data);
  }

  listGet(action: string, queryParams = {}): Observable<any> {
    return this.apiService.get(`${this._getListUrl()}${action}/`, null, RestClientService._getSearchParams(queryParams));
  }

  listPost(action: string, data: any): Observable<any> {
    return this.apiService.post(`${this._getListUrl()}${action}/`, data);
  }

  listPatch(action: string, data: {} = {}): Observable<any> {
    return this.apiService.patch(`${this._getListUrl()}${action}/`, data);
  }

  listPut(action: string, data: {} = {}): Observable<any> {
    return this.apiService.put(`${this._getListUrl()}${action}/`, data);
  }

  save(item): Observable<T> {
    if (!item.id)
      return this.create(item);
    return this.update(item.id, item);
  }

  update(id, data: T): Observable<T> {
    return this.apiService.put(`${this._getItemUrl(id)}`, data);
  }

  partialUpdate(id, data): Observable<T> {
    return this.apiService.patch(`${this._getItemUrl(id)}`, data);
  }

  create(item): Observable<T> {
    item.account = this.apiService.getAccount();
    return this.apiService.post(this._getListUrl(), item);
  }

  delete(id: number): Observable<any> {
    return this.apiService.delete(this._getItemUrl(id));
  }

  bulkCreate(itemList: any[]): Observable<T> {
    // item.account = this.apiService.getAccount();
    return this.apiService.post(this._getListUrl(), itemList);
  }

  bulkUpdate(itemList: any[]): Observable<T> {
    return this.apiService.put(this._getListUrl(), itemList);
  }

}
