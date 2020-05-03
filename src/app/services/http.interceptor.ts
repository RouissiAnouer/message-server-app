import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import 'rxjs/add/operator/do';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpUserEvent, HttpErrorResponse, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Storage } from '@ionic/storage';
import { User } from '../model/User';


const TOKEN_HEADER_KEY = 'Authorization';
const BASE_URL = 'http://localhost:8088/';

@Injectable()
export class Interceptor implements HttpInterceptor {
    public token: string;
    constructor(private router: Router, private storage: Storage) {
        // this.token = JSON.parse(localStorage.getItem('user')).token;
        this.storage.get('user').then(val => {
            if (val != null) {
                this.token = JSON.parse(val).token;
            }
        });
    }

    intercept(req: HttpRequest<any>, next: HttpHandler):
        Observable<HttpEvent<any>> {
        let authReq = req;
        if (this.token != null && req.url != BASE_URL + 'auth/login') {
            authReq = req.clone({ headers: req.headers.set(TOKEN_HEADER_KEY, 'Bearer ' + this.token) });
        } else {
            authReq = req.clone({ headers: req.headers.set('Content-Type','application/json') });
        }
        return next.handle(authReq).do(
            (err: any) => {
                if (err instanceof HttpErrorResponse) {

                    if (err.status === 401) {
                        this.router.navigate(['']);
                    }
                }
            }
        );
    }
}