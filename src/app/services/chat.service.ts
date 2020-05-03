import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpRequest, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from './../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  constructor(private http: HttpClient) { }
  getAllUser(username: string): Observable<HttpEvent<any>> {
    let params: HttpParams = new HttpParams().set('username', username);
    const request = new HttpRequest('GET', environment.baseUrl+'/user/getall', {params:params});
    return this.http.request(request);
  }
}
