import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpRequest, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../model/User';
import { RequestOptions } from '@angular/http';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(private http: HttpClient) { }

   login(username: string, password: string): Observable<HttpEvent<{}>> {
    let data = JSON.stringify({
      username: username,
      password: password
    });
    let headers = new HttpHeaders({
      "content-type": "application/json"
    });
    const request = new HttpRequest('POST', 'http://localhost:8088/auth/login', data, {
      headers: headers
    });
    return this.http.request(request);
  }
  getUserInfo(user: User): Observable<HttpEvent<{}>> {
    let header = new HttpHeaders({
      "content-type": "application/json",
      "Authorization": user.tokenType + ' ' + user.token
    });
    console.log(header.get('Authorization'));
    let params = new HttpParams().set('email', user.userName);
    const request = new HttpRequest('GET', 'http://localhost:8088/user/userinfo', {
      headers: header,
      params: params
    });
    return this.http.request(request);
  }
}
