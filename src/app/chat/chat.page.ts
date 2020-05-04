import { Storage } from '@ionic/storage';
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { User, UserInfo } from '../model/User';
import { HttpEventType, HttpResponse, HttpHeaders, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { ChatService } from '../services/chat.service';
import { ModalController } from '@ionic/angular';
import { ModalChat } from './modal-popup/chat-modal';
import { LoginService } from '../services/login.service';
import { AuthenticationService } from '../services/authentication-service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage {
  public usersInfo: Array<UserInfo>;
  public receiver: string;
  public user: User;
  constructor(
    private chatService: ChatService,
    public modalController: ModalController,
    public loginService: LoginService, private storage: Storage,
    private router: Router,
    private authService: AuthenticationService) {
    this.user = this.authService.getUser();
  }

  public ngOnInit(): void {
    if (this.user.userName) {
      this.chatService.getAllUser(this.user.userName).subscribe((res: HttpEvent<any>) => {
        if (res.type == HttpEventType.Sent) {
          console.log('loading...');
        } else if (res.type == HttpEventType.Response) {
          console.log('finish Loading');
          this.usersInfo = res.body;
          this.usersInfo.forEach((user: UserInfo) => {
            user.image = "assets/icon/img_avatar2.png"
            let array = user.sent.sort((a, b) => b.id - a.id);
            user.sent = [];
            array.forEach(item => {
              user.sent.push(item);
            })
          });
        }
      },
        err => {
          console.log(err);
        });
    } else {
      this.router.navigateByUrl('');
    }
  }

  public openChat(user: User) {

    this.loginService.getUserInfo(user).subscribe(res => {
      if (res.type == HttpEventType.Sent) {
        console.log('loading...');
      } else if (res.type == HttpEventType.Response) {
        this.presentModal(user.id, res.body);
      }
    },
      err => {
        console.log(err);
      });

  }

  public logout(): void {
    this.storage.remove('user');
    this.authService.setUser(null);
    this.authService.setAuthenticated(false);
    this.router.navigateByUrl('');
  }

  async presentModal(user: number, userInfoToChat: any) {
    const modal = await this.modalController.create({
      component: ModalChat,
      componentProps: {
        'receiver': user,
        'chat': userInfoToChat
      }
    });
    modal.onWillDismiss().then(() => {
      this.ngOnInit();
    });
    return await modal.present();
    
  }

}
