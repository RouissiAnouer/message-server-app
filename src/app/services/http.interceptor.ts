import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import 'rxjs/add/operator/do';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpUserEvent, HttpErrorResponse, HttpEvent } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { Storage } from '@ionic/storage';
import { mergeMap } from 'rxjs/operators';
import { User } from '../model/User';
import { AuthenticationService } from './authentication-service';
import { environment } from 'src/environments/environment';

@Injectable()
export class Interceptor implements HttpInterceptor {
    constructor(private router: Router,
        private storage: Storage, private AuthService: AuthenticationService) {
    }

    intercept(req: HttpRequest<any>, next: HttpHandler):
        Observable<HttpEvent<any>> {
        let promise = from(this.storage.get('user'));
        return promise.pipe(mergeMap((user: any) => {
            let cloneReq = this.addToken(req, JSON.parse(user));
            return next.handle(cloneReq).do(res => { },
                (err: any) => {
                    if (err instanceof HttpErrorResponse) {
                        if ([401, 403].indexOf(err.status) !== -1) {
                            // auto logout if 401 Unauthorized or 403 Forbidden response returned from api
                            this.AuthService.logout();
                            // location.reload(true);
                        }
                        return err;
                    }
                }
            );
        }));
    }

    private addToken(request: HttpRequest<any>, user: User): HttpRequest<any> {
        let clone: HttpRequest<any>;
        console.log(request.url);

        if (user) {
            if (request.url.startsWith(environment.baseUrl + '/user/image/')) {
                clone = request.clone({
                    setHeaders: {
                        Authorization: 'Bearer ' + user.token
                    }
                });
            } else {
                clone = request.clone({
                    setHeaders: {
                        Authorization: 'Bearer ' + user.token,
                        'Content-Type': 'application/json'
                    }
                });
            }
        } else {
            clone = request.clone({
                setHeaders: {
                    'Content-Type': 'application/json'
                }
            });
        }
        return clone;
    }
}