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
  getChats(id: string, receiver: string): Observable<HttpEvent<any>> {
    let params: HttpParams = new HttpParams().set('id', id).set('idTo', receiver);
    const request = new HttpRequest('GET', environment.baseUrl+'/chats/getchat', {params:params});
    return this.http.request(request);
  }
  getChatReceived(id: string): Observable<HttpEvent<any>> {
    let params: HttpParams = new HttpParams().set('id', id);
    const request = new HttpRequest('GET',environment.baseUrl+'/chats/getall', {params: params});
    return this.http.request(request);
  }
  updateChatStatus(ids: Array<number>): Observable<HttpEvent<any>> {
    let data: any = {
      ids: ids
    };
    const request = new HttpRequest('PUT',environment.baseUrl+'/chats/readchat', JSON.stringify(data), {});
    return this.http.request(request);
  }
}
