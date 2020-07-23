import { Injectable } from '@angular/core';
import { SocketIoService } from './socket-io-service.service';
import { Subject } from 'rxjs/Subject';
import { SocketEvent, SOCKET_EVENTS } from '../model/socketEvent';

@Injectable({
  providedIn: 'root'
})
export class SocketListenerService {

  private messagesEvent: Subject<SocketEvent> = new Subject();

  constructor(private socketIoService: SocketIoService) {}

  public initMessagesSocketListeners(chatIDs: Array<number>, userId: number): void {
    for (let id of chatIDs) {
      this.socketIoService.on(id + SOCKET_EVENTS.MESSAGE).subscribe((msg: any) => {
        // this.messagesEvent.next(this.createObject(msg, SHARED_EVENTS.MESSAGE));
        // this.messagesService.updateMessages(msg, msg.chatId);
        // this.communicationsEvent.next(this.createObject(msg, SHARED_EVENTS.MESSAGE_COM));
      });

      this.socketIoService.on(id + SOCKET_EVENTS.USER_ENTERED).subscribe((data: any) => {
        // this.messagesEvent.next(this.createObject(data, SHARED_EVENTS.USER_ENTERED));
        // this.communicationsEvent.next(this.createObject(data, SHARED_EVENTS.REFRESH_ENTERED));
      });

      this.socketIoService.on(id + SOCKET_EVENTS.USER_LEAVE).subscribe((data: any) => {
        // this.messagesEvent.next(this.createObject(data, SHARED_EVENTS.USER_LEAVE));
        // this.communicationsEvent.next(this.createObject(data, SHARED_EVENTS.REFRESH_LEAVE));
      });

      this.socketIoService.on(id + SOCKET_EVENTS.IS_TYPING).subscribe((data: any) => {
        // if (data.ownerId !== userId && data.typing) {
        //   this.messagesEvent.next(this.createObject(data, SHARED_EVENTS.IS_TYPING));
        // } else if (data.ownerId !== userId && !data.typing) {
        //   this.messagesEvent.next(this.createObject(data, SHARED_EVENTS.ISNT_TYPING));
        // }
      });

      this.socketIoService.on(SOCKET_EVENTS.RECONNECT).subscribe(() => {
        // this.socketIoService.send(SOCKET_EVENTS.USER_JOIN, { chatId: id });
        // console.log('rejoin');
      });

      this.socketIoService.send(SOCKET_EVENTS.USER_JOIN, { chatId: id });
    }
  }

  public listenToMessagesEvents(): Subject<SocketEvent> {
    return this.messagesEvent;
  }

}
