import { Storage } from '@ionic/storage';
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { User, UserInfo } from '../model/User';
import { HttpEventType, HttpResponse, HttpHeaders, HttpEvent } from '@angular/common/http';
import { Router } from '@angular/router';
import { ChatService } from '../services/chat.service';
import { ModalController } from '@ionic/angular';
import { ModalChat } from './modal-popup/chat-modal';
import { LoginService } from '../services/login.service';

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
    public loginService: LoginService, private storage: Storage) {
      storage.get('user').then((val) => {
        this.user = JSON.parse(val);
        this.getAllUser();
      })
      // this.user = JSON.parse(localStorage.getItem('user'));
  }

  public getAllUser(): void {
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

  async presentModal(user: number, userInfoToChat: any) {
    const modal = await this.modalController.create({
      component: ModalChat,
      componentProps: {
        'receiver': user,
        'chat': userInfoToChat
      }
    });
    return await modal.present();
  }

}
