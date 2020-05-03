import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpRequest, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  constructor(private http: HttpClient) { }
  getAllUser(username: string): Observable<HttpEvent<any>> {
    let params: HttpParams = new HttpParams().set('username', username);
    const request = new HttpRequest('GET', 'http://localhost:8088/user/getall', {params:params});
    return this.http.request(request);
  }
}
