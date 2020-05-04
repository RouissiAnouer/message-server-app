import { Injectable, Type } from '@angular/core';
import { Router } from '@angular/router';
import 'rxjs/add/operator/do';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpUserEvent, HttpErrorResponse, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AlertController } from '@ionic/angular';
import { _throw } from 'rxjs/observable/throw';
import { AuthenticationService } from './authentication-service';


const TOKEN_HEADER_KEY = 'Authorization';
const BASE_URL = 'http://localhost:8088/';

@Injectable()
export class Interceptor implements HttpInterceptor {
    public token: string;
    public tokenType: string;
    public authenticated: boolean;
    constructor(private router: Router, private authenticationService: AuthenticationService, private alertCtrl: AlertController) {

    }

    intercept(req: HttpRequest<any>, next: HttpHandler):
        Observable<HttpEvent<any>> {
        if (this.authenticationService.getUser() == null || !this.authenticationService.isAuthenticated) {
            this.authenticationService.setAuthenticated(false);
            this.authenticationService.setUser(null);
        } else {
            this.token = this.authenticationService.getUser().token;
            this.tokenType = this.authenticationService.getUser().tokenType;
        }
        this.authenticated = this.authenticationService.isAuthenticated();

        let authReq = req;
        if (this.authenticated) {
            authReq = req.clone({
                setHeaders: {
                    Authorization: 'Bearer ' + this.token,
                    'Content-Type': 'application/json'
                }
            });
            // authReq = req.clone({ headers: req.headers.set(TOKEN_HEADER_KEY, 'Bearer ' + this.token) });
        } else {
            authReq = req.clone({
                setHeaders: {
                    'Content-Type': 'application/json'
                }
            });
            // authReq = req.clone({ headers: req.headers.set('Content-Type', 'application/json') });
        }
        console.log(authReq);
        return next.handle(authReq).do(res => {},
            (err: any) => {
                if (err instanceof HttpErrorResponse) {

                    if (err.status === 401) {
                        this.router.navigateByUrl('');
                    }
                }
            }
        );
    }
}