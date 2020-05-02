import { Component, OnInit, AfterViewInit } from '@angular/core';
import * as Stomp from 'stompjs';
import * as SockJS from 'sockjs-client';
import { User } from '../model/User';
import { LoginService } from '../services/login.service';
import { HttpEventType, HttpResponse, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements AfterViewInit {
  public user: User;
  public from: string; 
  public receiver: string; 
  public text: string;
  constructor(private loginService:LoginService, private route: Router) {
    this.user = JSON.parse(localStorage.getItem('user'));
   }

   public ngAfterViewInit(): void {
    this.loginService.getUserInfo(this.user).subscribe(res => {
      if (res.type == HttpEventType.Sent) {
        console.log('loading...');
      } else if (res instanceof HttpResponse) {
        let body: any = res.body;
        this.from = body.id;
        console.log(this.from);
        this.receiver = '2';
        this.connect(this.from);
      }
    },
    err => {
      // this.disconnect(this.from);
      this.route.navigate(['']);
    })
   }

  greetings: string[] = [];
  showConversation: boolean = false;
  ws: any;
  disabled: boolean;

  public connect(owner: string) {
    let header = new HttpHeaders({
      "content-type": "application/json",
      "Authorization": this.user.tokenType + ' ' + this.user.token
    });
    //connect to stomp where stomp endpoint is exposed
    let socket = new SockJS("http://localhost:8088/greeting", null, {headers: {"Authorization": this.user.tokenType + ' ' + this.user.token}});
    // let socket = new WebSocket("ws://localhost:8088/greeting");
    this.ws = Stomp.over(socket);
    let that = this;
    let sessionId = "";


    this.ws.connect({}, function (frame) {

      that.ws.subscribe("/errors", function (message) {
        alert("Error " + message.body);
      });
      that.ws.subscribe("/topic/reply."+owner, function (message) {
        console.log(JSON.parse(message.body))
        that.showGreeting(JSON.parse(message.body));
      });
      that.disabled = true;
    }, function (error) {
      alert("STOMP error " + error);
    });
  }

  sendMessage(receiver: string, message: string, from) {
    let data = JSON.stringify({
      from: this.from,
      text: this.text
    })
    this.ws.send("/app/message/"+this.receiver, {}, data);
  }

  showGreeting(message) {
    this.showConversation = true;
    this.greetings.push(message)
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
