import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpRequest, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

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
}
