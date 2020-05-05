import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpRequest, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../model/User';
import { environment } from './../../environments/environment';
import { SignUpRequest } from '../model/signUpRequest';

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
    const request = new HttpRequest('POST', environment.baseUrl + '/auth/login', data, {});
    return this.http.request(request);
  }
  getUserInfo(user: User): Observable<HttpEvent<{}>> {
    let params = new HttpParams().set('email', user.userName);
    const request = new HttpRequest('GET', environment.baseUrl + '/user/userinfo', {
      params: params
    });
    return this.http.request(request);
  }
  signUpUser(signUpRequest: SignUpRequest): Observable<HttpEvent<any>> {
    const request = new HttpRequest('POST', environment.baseUrl + '/auth/signup', JSON.stringify(signUpRequest), {});
    return this.http.request(request);
  }
}
