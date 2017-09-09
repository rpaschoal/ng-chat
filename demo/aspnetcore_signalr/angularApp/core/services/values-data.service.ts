import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { Configuration } from '../../app.constants';
import { User } from 'ng-chat';

@Injectable()
export class DataService {

    private actionUrl: string;
    private headers: Headers;
    private chatUrl: string;

    constructor(private _http: Http, private _configuration: Configuration) {

        this.actionUrl = _configuration.ServerWithApiUrl + 'values/';
        this.chatUrl = _configuration.ServerWithApiUrl + 'chat/';

        this.headers = new Headers();
        this.headers.append('Content-Type', 'application/json');
        this.headers.append('Accept', 'application/json');
    }

    public GetAll = (): Observable<any> => {
        return this._http.get(this.actionUrl).map((response: Response) => <any>response.json());
    }

    public GetSingle = (id: number): Observable<Response> => {
        return this._http.get(this.actionUrl + id).map(res => res.json());
    }

    public Add = (itemName: string): Observable<Response> => {
        let toAdd = JSON.stringify({ ItemName: itemName });

        return this._http.post(this.actionUrl, toAdd, { headers: this.headers }).map(res => res.json());
    }

    public Update = (id: number, itemToUpdate: any): Observable<Response> => {
        return this._http
            .put(this.actionUrl + id, JSON.stringify(itemToUpdate), { headers: this.headers })
            .map(res => res.json());
    }

    public Delete = (id: number): Observable<Response> => {
        return this._http.delete(this.actionUrl + id);
    }

    public ListFriends = (): Observable<User[]> => {
        return this._http.post(this.chatUrl + "ListFriends", { headers: this.headers }).map(res => res.json());
    }
}
