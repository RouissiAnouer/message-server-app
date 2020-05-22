import { Storage } from '@ionic/storage';
import { Component, Input, ViewChild, AfterViewChecked } from '@angular/core';
import { User, Chats } from 'src/app/model/User';
import { ModalController, NavParams, IonContent } from '@ionic/angular';
import { DatePipe } from '@angular/common';
import { AuthenticationService } from 'src/app/services/authentication-service';
import { ChatSocketService } from 'src/app/services/chat-socket.service';
import { Message } from 'src/app/model/message';
import { StompHeaders } from '@stomp/stompjs';
import { ChatsList } from 'src/app/model/chats-response';
import { ChatService } from 'src/app/services/chat.service';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { first } from 'rxjs/operators';
import { UserService } from 'src/app/services/user.service';

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
    public msgList: Array<ChatsList> = new Array<ChatsList>();
    public greetings: string[] = [];
    public count: number = 0;
    public sent: Array<Chats>;
    public received: Array<Chats>;
    public friendAvatar: string;

    constructor(private modalCtrl: ModalController,
        private params: NavParams,
        private datePipe: DatePipe,
        private storage: Storage,
        private chatService: ChatService,
        private socketService: ChatSocketService,
        private userService: UserService) {
        this.storage.get('user').then(val => {
            this.user = JSON.parse(val);
            this.userService.getUserInfo(this.user.userName).subscribe((res: any) => {
                if (res instanceof HttpResponse) {
                    this.user = res.body;
                    this.getPage();
                }
            })
            
        });
        
        this.sent = this.params.get('sent');
        this.received = this.params.get('received');
        this.friendAvatar = this.params.get("avatar");
    }
    ngAfterViewChecked(): void {
        this.content.scrollToBottom(500);
    }

    getPage(): void {
        let unReadMessages: Array<number> = new Array<number>();
        this.received.forEach(msg => {
            let obj: ChatsList = {
                message: msg.message,
                time: msg.time,
                userAvatar: this.friendAvatar,
                userId: 'User',
                id: msg.id
            };
            if (!msg.read) {
                unReadMessages.push(msg.id);
            }
            this.msgList.push(obj);
        });
        if (unReadMessages.length > 0) {
           this.updateChat(unReadMessages);
        }
        this.sent.forEach(msg => {
            let obj: ChatsList = {
                message: msg.message,
                time: msg.time,
                userAvatar: this.user.userAvatar,
                userId: 'toUser',
                id: msg.id
            };
            this.msgList.push(obj);
        });
        let array = this.msgList.sort((a, b) => a.id - b.id);
        this.msgList = [];
        array.forEach(item => {
            this.msgList.push(item);
        });
        if (array.length > 0) {
            this.count = this.msgList[this.msgList.length - 1].id;
        }
        this.connectSocket(this.user.id);
    }

    dismiss() {
        this.socketService.disconnect();
        this.modalCtrl.dismiss({
            'dismissed': true
        });
    }

    showGreeting(message) {
        if (message.from === this.receiver.toString()) {
            this.updateChat([message.id]);
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

    async updateChat(unReadMessages: Array<number>): Promise<any> {
        this.chatService.updateChatStatus(unReadMessages).subscribe(response => {
            if (response.type === HttpEventType.Sent) {
                console.log('loading ...');
            } else if (response.type === HttpEventType.Response) {
                console.log(response);
            }
        });
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
        this.socketService.onMessage('/topic/reply.' + owner).subscribe(message => {
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