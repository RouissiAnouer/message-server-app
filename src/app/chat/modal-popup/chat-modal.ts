import { Storage } from '@ionic/storage';
import { Component, Input, OnInit, ViewChild, AfterViewInit, ViewChildren, AfterViewChecked } from '@angular/core';
import { User, Chats, UserInfo } from 'src/app/model/User';
import { HttpHeaders } from '@angular/common/http';
import * as Stomp from 'stompjs';
import * as SockJS from 'sockjs-client';
import { ModalController, NavParams, IonContent } from '@ionic/angular';
import { DatePipe } from '@angular/common';
import { environment } from './../../../environments/environment';
import { AuthenticationService } from 'src/app/services/authentication-service';
import { ChatSocketService } from 'src/app/services/chat-socket-service.service';
import { Message } from 'src/app/model/message';
import { StompHeaders } from '@stomp/stompjs';

export interface ChatsList {
    userId: string;
    userAvatar: string;
    message: string;
    time: string;
    id: number;
}

@Component({
    selector: 'modal-page',
    templateUrl: './chat.modal.html',
    styleUrls: ['./chat.modal.scss'],
})
export class ModalChat implements AfterViewChecked {

    @ViewChild('IonContent', { static: false }) content: IonContent;

    @Input() receiver: number;
    @Input() userInput: string;
    public user: User;
    public chats: UserInfo;
    public avatar: string;
    public msgList: Array<ChatsList> = new Array<ChatsList>();
    public greetings: string[] = [];
    public showConversation: boolean = false;
    public ws: any;
    public disabled: boolean;
    public count: number;
    public sent: Array<Chats>;
    public received: Array<Chats>;

    constructor(private modalCtrl: ModalController, 
        private params: NavParams, 
        private datePipe: DatePipe, 
        private storage: Storage,
        private authService: AuthenticationService,
        private socketService: ChatSocketService) {
        this.storage.get('user').then(val => {
            this.user = JSON.parse(val);
            this.user.userAvatar = "assets/icon/img_avatar2.png";
            this.getPage();
        });
        this.sent = this.params.get('sent');
        this.received = this.params.get('received');
    }
    ngAfterViewChecked(): void {
        this.content.scrollToBottom(500);
    }

    getPage(): void {
        this.received.forEach(msg => {
            let obj: ChatsList = {
                message: msg.message,
                time: msg.time,
                userAvatar: "assets/icon/img_avatar2.png",
                userId: 'User',
                id: msg.id
            };
            this.msgList.push(obj);
        });
        this.sent.forEach(msg => {
            let obj: ChatsList = {
                message: msg.message,
                time: msg.time,
                userAvatar: "assets/icon/img_avatar2.png",
                userId: 'toUser',
                id: msg.id
            };
            this.msgList.push(obj);
            let array = this.msgList.sort((a, b) => a.id - b.id);
            this.msgList = [];
            array.forEach(item => {
                this.msgList.push(item);
            })
        });
        this.count = this.msgList[this.msgList.length - 1].id;
        this.connectSocket(this.user.id);
    }

    dismiss() {
        this.modalCtrl.dismiss({
            'dismissed': true
        });
    }

    showGreeting(message) {
        if (message.from === this.receiver.toString()) {
            let obj: ChatsList = {
                message: message.text,
                time: message.time,
                userAvatar: this.user.userAvatar,
                userId: 'User',
                id: message.id
            };
            this.count = message.id;
            this.msgList.push(obj);
            this.greetings.push(message)
            setTimeout(() => {
                this.content.scrollToBottom(500);
            }, 10);
        }
    }

    sendMessageTo() {
        let headers: StompHeaders = {
            'Authorization': this.user.tokenType + ' ' + this.user.token,
            'Content-Type': 'application/json'
        }
        let now = this.datePipe.transform(new Date(), 'MMM d, y, h:mm:ss a');
        let data: Message = {
            from: this.user.id.toString(),
            text: this.userInput,
            time: now
        };
        this.socketService.send('/send/message/' + this.receiver, data, headers);
        this.orderSentMessage(now);
    }

    connectSocket(owner: number): void {
        this.socketService.onMessage('/topic/reply.'+owner).subscribe(message => {
            this.showGreeting(message);
        });
    }

    orderSentMessage(now: string): void {
        let obj: ChatsList = {
            message: this.userInput,
            time: now,
            userAvatar: this.user.userAvatar,
            userId: 'toUser',
            id: this.count++
        };
        this.msgList.push(obj);
        let array = this.msgList.sort((a, b) => a.id - b.id);
        this.msgList = [];
        array.forEach(item => {
            this.msgList.push(item);
        })
        this.userInput = '';
        setTimeout(() => {
            this.content.scrollToBottom(500);
        }, 10);
    }

}