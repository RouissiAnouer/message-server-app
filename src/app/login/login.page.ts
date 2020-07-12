import { Component, OnInit } from '@angular/core';
import { LoginService } from '../services/login.service';
import { HttpResponse, HttpEventType } from '@angular/common/http';
import { User } from '../model/User';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage';
import { AuthenticationService } from '../services/authentication-service';
import { ToastController, MenuController } from '@ionic/angular';
import { Push, PushOptions, PushObject } from '@ionic-native/push/ngx';
import { pushConfig } from 'src/environments/environment';
import { PushNotificationService } from '../services/push-notification.service';

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
    private toastCtrl: ToastController,
    private menuCtrl: MenuController,
    private push: Push,
    private pushNotificationService: PushNotificationService) { }

  ngOnInit() {
  }

  public checkSession() {
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
        this.menuCtrl.enable(true);
        this.storage.set('user', JSON.stringify(data.body));
        this.authService.setUser(this.user);
        this.initPushNotification(this.user.id);
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

  private initPushNotification(id: number): void {
    if (pushConfig.enablePushNotification) {
      this.push.hasPermission()
        .then((res: any) => {
          const options: PushOptions = {
            android: pushConfig.pushNotificationConfig.ANDROID_CONFIG,
            ios: pushConfig.pushNotificationConfig.IOS_CONFIG
          }
          if (res.isEnabled) {
            this.push.createChannel({
              id: pushConfig.pushNotificationConfig.CHANNEL_ID,
              description: pushConfig.pushNotificationConfig.CHANNEL_DESC,
              importance: pushConfig.pushNotificationConfig.CHANNEL_IMPORTANCE,
              badge: true
            }).then(() => {
              const pushObject: PushObject = this.push.init(options);

              pushObject.on('notification').subscribe((notification: any) => console.log('Received a notification', notification));

              pushObject.on('registration').subscribe((registration: any) => {
                console.log('Device registered', registration);
                this.pushNotificationService.registerDeviceToken(registration.registrationId, id.toString()).subscribe((data: any) => {
                  if (data instanceof HttpResponse) {
                    console.log('registred token to topic');
                  }
                });
              });

              pushObject.on('error').subscribe(error => console.error('Error with Push plugin', error));

            });
          } else {
            console.warn('We do not have permission to send push notifications');
          }
        }).catch(err => console.error(err));
    } else {
      console.warn('push are not enabled in the environment');
    }

  }

}
