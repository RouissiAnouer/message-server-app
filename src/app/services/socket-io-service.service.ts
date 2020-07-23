import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';


@Injectable({
  providedIn: 'root'
})
export class SocketIoService {

  private socket: SocketIOClient.Socket;
  protected status$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  protected reconnectAttempt$: Subject<number> = new Subject();

  constructor() { }

  /**
   * @param socketHost The socket host.
   * @param user User. We'll use the id to establish connection with the socket.
   * @returns
   */
  public connect(socketHost: string, token: string): void {
    let connectionObject: SocketIOClient.ConnectOpts = {
      query: 'xtoken=' + token,
      reconnection: true,
      transports: ['websocket', 'polling'],
      autoConnect: true
    };

    this.socket = io.connect(socketHost, connectionObject);
    this.defaultListeners();
  }

   /**
   * @description The default listeners of the Socket.
   */
  private defaultListeners(): void {
    this.socket.on('connect', (connect: any) => {
      console.log('Connect has been fired!');
      this.status$.next(true);
    });

    this.socket.on('disconnect', (disconnect: any) => {
      console.log('Disconnect has been fired!');
      this.status$.next(false);
    });

    this.socket.on('reconnect', (reconnect: any) => {
      console.log('Reconnect event!');
    });

    this.socket.on('reconnect_attempt', (reconnectAttempt: any) => {
      console.log('reconnect_attempt');
      this.reconnectAttempt$.next(reconnectAttempt);
    });
  }

  public open(): void {
    this.socket.open();
  }

  /**
   * @description Use this method to track how many reconnection attemps are been made
   */
  public getReconnectionCounter(): Observable<number> {
    return this.reconnectAttempt$.asObservable();
  }

  /**
   * @description Use this method to manually remove all the listeners.
   */
  public removeAllListners(): void {
    this.socket.removeAllListeners();
  }

  /**
   * @description Retuns an Observable to watch the status of the socket.
   * @returns
   */
  public checkStatus(): Observable<boolean> {
    return this.status$.asObservable();
  }

  /**
   * @description Returns the current status of the socket.
   * @returns
   */
  public status(): boolean {
    return this.socket.connected;
  }

  /**
   * @description Disconnect the socket.
   */
  public disconnect(): void {
    this.socket = this.socket.close();
    this.socket.removeAllListeners();
  }

  /**
   * Sends event.
   * @param type
   * @param message
   * @returns
   */
  public send(type: string, message: any): void {
    this.socket.emit(type, message);
  }

  /**
   * @description The name of the event we want to create.
   * @param eventName
   */
  public on(eventName: string): Observable<any> {
    let observable: Observable<any> = new Observable(observer => {
      this.socket.on(eventName, (data: any) => {
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    });
    return observable;
  }
}
