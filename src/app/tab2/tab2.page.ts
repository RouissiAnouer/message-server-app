import { Component, OnInit } from '@angular/core';
import * as Stomp from 'stompjs';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page implements OnInit {
  public from: string = "2"; 
  public receiver: string = "1"; 
  public text: string;

  constructor() {}


  
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
        console.log(JSON.parse(message.body));
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
