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
import { ChatSocketService } from '../services/chat-socket.service';
import { ChatsResponse } from '../model/chats-response';
import { MessageReceived } from '../model/message';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage {
  public chatsReceived: Array<MessageReceived>;
  public receiver: string;
  public user: User;
  constructor(
    private chatService: ChatService,
    public modalController: ModalController,
    public loginService: LoginService,
    private socketService: ChatSocketService,
    private authService: AuthenticationService) {
  }

  public ionViewWillEnter(): void {
    this.authService.isAuthenticated().then(res => {
      if (res) {
        this.getChats();
      }
    });
  }

  private getChats(): void {
    this.user = this.authService.getUserInfo();
    this.user.userAvatar = "assets/icon/img_avatar2.png";
    this.chatService.getChatReceived(this.user.id.toString()).subscribe((res: HttpEvent<any>) => {
      if (res.type == HttpEventType.Sent) {
        console.log('Loading ...');
      } else if (res.type == HttpEventType.Response) {
        this.chatsReceived = res.body.chats;
        // this.connectSocket(this.user.id);
      }
    });
  }

  public openChat(user: User) {
    this.chatService.getChats(this.user.id.toString(), user.id.toString()).subscribe(res => {
      if (res.type == HttpEventType.Sent) {
        console.log('loading...');
      } else if (res.type == HttpEventType.Response) {
        // this.socketService.disconnect();
        let response: ChatsResponse = {
          sent: res.body.sent,
          received: res.body.received
        }
        this.presentModal(user.id, response);
      }
    },
      err => {
        console.log(err);
      });
  }

//   connectSocket(owner: number): void {
//     this.socketService.onMessage('/topic/reply.' + owner).subscribe(message => {
//         this.getChats();
//     });
// }

  public logout(): void {
    this.authService.logout();
  }

  async presentModal(user: number, chats: ChatsResponse) {
    const modal = await this.modalController.create({
      component: ModalChat,
      componentProps: {
        'receiver': user,
        'sent': chats.sent,
        'received': chats.received
      }
    });
    modal.onWillDismiss().then(() => {
      this.ionViewWillEnter();
    });
    return await modal.present();

  }

}
