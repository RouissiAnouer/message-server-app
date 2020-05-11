import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) { }

  uploadImageProfile(image: any, username: string): Observable<HttpEvent<any>> {
    const request = new HttpRequest('PUT', environment.baseUrl+'/user/uploadimage', JSON.stringify({image: image,username:username}),{});
    return this.http.request(request);
  }

}
