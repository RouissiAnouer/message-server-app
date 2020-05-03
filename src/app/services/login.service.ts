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
    const request = new HttpRequest('POST', 'http://localhost:8088/auth/login', data, {});
    return this.http.request(request);
  }
  getUserInfo(user: User): Observable<HttpEvent<{}>> {
    let params = new HttpParams().set('email', user.userName);
    const request = new HttpRequest('GET', 'http://localhost:8088/user/userinfo', {
      params: params
    });
    return this.http.request(request);
  }
}
