import { Injectable, OnDestroy } from '@angular/core';
import * as SockJS from 'sockjs-client';
import { environment } from 'src/environments/environment';
import { Client, over, Message, StompSubscription, StompHeaders } from '@stomp/stompjs';
import { BehaviorSubject, Observable } from 'rxjs';
import { socketClientState } from '../model/socketClientState';
import { filter, first, switchMap } from 'rxjs/operators';
import { AuthenticationService } from './authentication-service';
import { User } from '../model/User';

@Injectable({
  providedIn: 'root'
})
export class ChatSocketService implements OnDestroy {
  private client: Client;
  private state: BehaviorSubject<socketClientState>;
  private user: User;
  constructor(private authService: AuthenticationService) {
    this.client = over(new SockJS(environment.baseUrl + environment.socketUrl));
    this.state = new BehaviorSubject<socketClientState>(socketClientState.ATTEMPTING);
    this.authService.getUser().then(user => {
      let headers: StompHeaders = {
        'Authorization': user.tokenType + ' ' + user.token,
        'Content-Type': 'application/json'
      };
      this.client.connect(headers, () => {
        this.state.next(socketClientState.CONNECTED);
      }, (err) => {
        this.state.next(socketClientState.ATTEMPTING);
        console.log(err);
      });
    });
  }

  public connect(): Observable<Client> {
    return new Observable<Client>(observer => {
      this.state.pipe(filter(state => state === socketClientState.CONNECTED)).subscribe(() => {
        observer.next(this.client);
      })
    });
  }

  ngOnDestroy(): void {
    this.connect().pipe(first()).subscribe(inst => inst.disconnect(null));
  }

  disconnect(): void {
    this.connect().forEach((sub: any) => {
      let map: Map<String, any> = sub.subscriptions;
      for (let key of Object.keys(map)) {
        sub.unsubscribe(key);
      }
    });
  }

  onMessage(topic: string, handler = ChatSocketService.jsonHandler): Observable<any> {
    return this.connect().pipe(first(), switchMap(inst => {
      return new Observable<any>(observer => {
        const subscription: StompSubscription = inst.subscribe(topic, message => {
          observer.next(handler(message));
        });
        return () => inst.unsubscribe(subscription.id);
      });
    }));
  }

  onPlainMessage(topic: string): Observable<string> {
    return this.onMessage(topic, ChatSocketService.textHandler);
  }

  send(topic: string, payload: any, headers?: StompHeaders): void {
    this.connect().pipe(first()).subscribe(inst => inst.send(topic, headers, JSON.stringify(payload)));
  }
  static jsonHandler(message: Message): any {
    return JSON.parse(message.body);
  }

  static textHandler(message: Message): string {
    return message.body;
  }


}
