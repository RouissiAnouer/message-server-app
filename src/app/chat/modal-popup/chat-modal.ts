import { Storage } from '@ionic/storage';
import { Component, Input, OnInit, ViewChild, AfterViewInit, ViewChildren, AfterViewChecked } from '@angular/core';
import { User, Chats, UserInfo } from 'src/app/model/User';
import { HttpHeaders } from '@angular/common/http';
import * as Stomp from 'stompjs';
import * as SockJS from 'sockjs-client';
import { ModalController, NavParams, IonContent } from '@ionic/angular';
import { DatePipe } from '@angular/common';
import { environment } from './../../../environments/environment';

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
    public received: Array<Chats>;
    public avatar: string;
    public msgList: Array<ChatsList> = new Array<ChatsList>();
    public greetings: string[] = [];
    public showConversation: boolean = false;
    public ws: any;
    public disabled: boolean;
    public count: number;

    constructor(private modalCtrl: ModalController, private params: NavParams, private datePipe: DatePipe, private storage: Storage) {
        // this.user = JSON.parse(localStorage.getItem('user'));
        this.storage.get('user').then(val => {
            this.user = JSON.parse(val);
            this.user.userAvatar = "assets/icon/img_avatar2.png";
            this.getPage();
        });
        this.chats = this.params.get('chat');
        this.count = 60;
    }
    ngAfterViewChecked(): void {
        this.content.scrollToBottom(500);
    }

    getPage(): void {
        console.log(this.chats);
        this.chats.received.forEach(msg => {
            let obj: ChatsList = {
                message: msg.message,
                time: msg.timestamp,
                userAvatar: "assets/icon/img_avatar2.png",
                userId: 'toUser',
                id: msg.id
            };
            this.msgList.push(obj);
        });
        this.chats.sent.forEach(msg => {
            let obj: ChatsList = {
                message: msg.message,
                time: msg.timestamp,
                userAvatar: "assets/icon/img_avatar2.png",
                userId: 'User',
                id: msg.id
            };
            this.msgList.push(obj);
            let array = this.msgList.sort((a, b) => a.id - b.id);
            this.msgList = [];
            array.forEach(item => {
                this.msgList.push(item);
            })
        });
        console.log(this.msgList);
        this.connect(this.user.id);
    }

    dismiss() {
        // using the injected ModalController this page
        // can "dismiss" itself and optionally pass back data
        this.modalCtrl.dismiss({
            'dismissed': true
        });
    }

    public connect(owner: number) {
        //connect to stomp where stomp endpoint is exposed
        let socket = new SockJS(environment.baseUrl + "/greeting");
        // let socket = new WebSocket("ws://localhost:8088/greeting");
        this.ws = Stomp.over(socket);
        let that = this;

        this.ws.connect({}, function (frame) {

            that.ws.subscribe("/errors", function (message) {
                alert("Error " + message.body);
            });
            that.ws.subscribe("/topic/reply." + owner, function (message) {
                console.log(JSON.parse(message.body))
                that.showGreeting(JSON.parse(message.body));
            });
            that.disabled = true;
        }, function (error) {
            // alert("STOMP error " + error);
        });
    }

    sendMessage() {
        let now = new Date();
        let data = JSON.stringify({
            from: this.user.id,
            text: this.userInput,
            time: this.datePipe.transform(now, "HH:mm:ss")
        })
        this.ws.send("/app/message/" + this.receiver, {}, data);
        let obj: ChatsList = {
            message: this.userInput,
            time: this.datePipe.transform(now, "HH:mm:ss"),
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
            this.content.scrollToBottom(8);
        }, 10);
    }

    showGreeting(message) {
        this.showConversation = true;
        let now = new Date();
        let obj: ChatsList = {
            message: message.text,
            time: this.datePipe.transform(now, "HH:mm:ss"),
            userAvatar: this.user.userAvatar,
            userId: 'User',
            id: this.count++
        };
        this.msgList.push(obj);
        this.greetings.push(message)
        setTimeout(() => {
            this.content.scrollToBottom(8);
        }, 10);
    }

    setConnected(connected) {
        this.disabled = connected;
        this.showConversation = connected;
        this.greetings = [];
    }

    public disconnect(from: string) {
        this.ws.disconnect();
    }

}