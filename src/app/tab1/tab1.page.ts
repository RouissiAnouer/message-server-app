import { Component, OnInit } from '@angular/core';
import * as Stomp from 'stompjs';
import * as SockJS from 'sockjs-client';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit {

  public from: string = "1"; 
  public receiver: string = "2"; 
  public text: string;

  constructor() {}


  
  greetings: string[] = [];
  showConversation: boolean = false;
  ws: any;
  disabled: boolean;

  public connect(owner: string) {
    //connect to stomp where stomp endpoint is exposed
    let socket = new SockJS("http://192.168.1.96:8088/greeting");
    // let socket = new WebSocket("ws://192.168.1.116:8088/greeting");
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


  public ngOnInit(): void {
   this.connect(this.from);
  }

  public disconnect(from: string) {
    this.disconnect(from);
  }


}
