import { Injectable } from "@angular/core";
import * as Stomp from 'stompjs';
import * as SockJS from 'sockjs-client';

export interface Message {
  author: string;
  message: string;
}

@Injectable()
export class ChatService {

  constructor() {

  }

  greetings: string[] = [];
  showConversation: boolean = false;
  ws: any;
  disabled: boolean;

  public connect(owner: string) {
    //connect to stomp where stomp endpoint is exposed
    //let ws = new SockJS(http://localhost:8080/greeting);
    let socket = new WebSocket("ws://localhost:8088/greeting");
    this.ws = Stomp.over(socket);
    let that = this;
    let sessionId = "";

    this.ws.connect({}, function (frame) {

      that.ws.subscribe("/errors", function (message) {
        alert("Error " + message.body);
      });
      that.ws.subscribe("/topic/reply."+owner, function (message) {
        console.log(message)
        that.showGreeting(message.body);
      });
      that.disabled = true;
    }, function (error) {
      alert("STOMP error " + error);
    });
  }

  public disconnect(owner: string) {
    if (this.ws != null) {
      this.ws.ws.close();
    }
    this.setConnected(false);
    console.log("Disconnected");
  }

  sendMsg(receiver: string, message: string, from) {
    let data = JSON.stringify({
      'from': from,
      'text': message
    })
    this.ws.send("/app/message/"+receiver, {}, data);
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
}