import { Component, OnInit } from '@angular/core';
import { LoginService } from '../services/login.service';
import { HttpResponse, HttpEventType } from '@angular/common/http';
import { User } from '../model/User';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage';
import { AuthenticationService } from '../services/authentication-service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  public username: string;
  public password: string;

  public user: User;

  constructor(
    private loginService: LoginService,
    private routes: Router,
    private storage: Storage,
    private authService: AuthenticationService,
    private toastCtrl: ToastController) { }

  ngOnInit() {
  }

  public chackSession() {
    this.authService.isAuthenticated().then(res => {
      if (res) {
        this.createToast('Login out from the old session', 'warning', 2000, true).then(toast => {
          toast.present();
          toast.onWillDismiss().then(() => {
            this.authService.logout();
          });
          toast.onDidDismiss().then(() => {
            this.login();
          })
        });
      } else {
        this.login();
      }
    });

  }

  private login(): void {
    this.loginService.login(this.username, this.password).subscribe((data: any) => {
      if (data instanceof HttpResponse) {
        this.user = data.body;
        this.storage.set('user', JSON.stringify(data.body));
        this.authService.setUser(this.user);
        console.log("finish loading");
        this.routes.navigate(['chat']);
      } else if (data.type == HttpEventType.Sent) {
        console.log("loading...");
      }
    },
      err => {
        this.createToast(err.message, 'danger', 2000).then(toast => toast.present());
      });
  }

  async createToast(message: string, color: string, duration: number, top?: boolean): Promise<HTMLIonToastElement> {
    return await this.toastCtrl.create({
      message: message,
      duration: duration,
      color: color,
      position: top ? "top" : "bottom" 
    });
  }

}
