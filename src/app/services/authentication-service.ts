import { Injectable } from '@angular/core';
import { User } from '../model/User';
import { Storage } from '@ionic/storage';


@Injectable()
export class AuthenticationService {

    constructor(private storage: Storage){}

    public user: User = null;
    public authenticated: boolean = false;

    public setUser(user: User) {
        this.user = user;
    }

    public getUser(): User {
        return this.user;
    }

    public setAuthenticated(auth: boolean) {
        this.authenticated = auth;
    }

    public isAuthenticated(): boolean {
        return this.authenticated;
    }
}