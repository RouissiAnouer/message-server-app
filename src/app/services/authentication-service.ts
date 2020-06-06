import { Injectable } from '@angular/core';
import { User } from '../model/User';
import { Storage } from '@ionic/storage';
import { Router } from '@angular/router';


@Injectable()
export class AuthenticationService {

    constructor(private storage: Storage, private router: Router) { }

    public user: User = null;
    public authenticated: boolean = false;

    public setUser(user: User) {
        this.storage.set('user', JSON.stringify(user));
        this.user = user;
        this.setAuthenticated(true);
    }

    public getUser(): Promise<any> {
        return this.storage.get('user').then(val => {
            return JSON.parse(val);
        });
    }

    public getUserInfo(): User {
        return this.user;
    }

    public setAuthenticated(auth: boolean) {
        this.authenticated = auth;
    }

    public isAuthenticated(): Promise<boolean> {
        return new Promise((resolve) => {
            this.getUser().then(val => {
                if (val) {
                    this.user = val;
                    resolve(true);
                } else {
                    resolve(false);
                }
            });
        });
    }

    public logout(): void {
        this.storage.clear().then(() => {
            this.setUser(null);
            this.setAuthenticated(false);
            this.router.navigateByUrl('login');
        });
    }
}