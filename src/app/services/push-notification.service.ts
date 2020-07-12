import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PushNotificationService {

  constructor(private http: HttpClient) { }

  registerDeviceToken(deviceToken: string, topic: string): Observable<HttpEvent<{}>> {
    let data: any = {
      deviceToken: deviceToken,
      topic: topic
    };
    const request = new HttpRequest('POST', environment.baseUrl + '/user/push/register', data, {});
    return this.http.request(request);
  }
}
