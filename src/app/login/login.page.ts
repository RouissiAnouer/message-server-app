import { Component, OnInit } from '@angular/core';
import { LoginService } from '../services/login.service';
import { HttpResponse, HttpEventType } from '@angular/common/http';
import { User } from '../model/User';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  public username: string;
  public password: string;

  public user: User;

  constructor(private loginService: LoginService, private routes: Router, private storage: Storage) { }

  ngOnInit() {
  }

  public login() {
    this.loginService.login(this.username, this.password).subscribe((data: any) => {
      if (data instanceof HttpResponse) {
        this.user = data.body;
        this.storage.set('user', JSON.stringify(data.body));
        console.log("finish loading");
        this.storage.get('user').then(val => {
          console.log(val);
        })
        this.routes.navigate(['chat']);
      } else if (data.type == HttpEventType.Sent) {
        console.log("loading...");
      }
    });
  }

}
