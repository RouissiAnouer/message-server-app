import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpRequest, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { User } from '../model/User';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) { }

  uploadImageProfile(image: File, username: string): Observable<HttpEvent<any>> {
    const data: FormData = new FormData();
    data.append('image', image, username);
    const request = new HttpRequest('PUT', environment.baseUrl+'/user/uploadimage', data,{});
    return this.http.request(request);
  }
  getUserInfo(userName: string): Observable<HttpEvent<{}>> {
    let params = new HttpParams().set('email', userName);
    const request = new HttpRequest('GET', environment.baseUrl + '/user/userinfo', {
      params: params
    });
    return this.http.request(request);
  }

}
