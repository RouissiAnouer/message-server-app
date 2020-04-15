import { Injectable } from "@angular/core";
import { Subject } from "rxjs/Rx";

const CHAT_URL = "ws://localhost:8088/user/chat";

export interface Message {
  author: string;
  message: string;
}

@Injectable()
export class ChatService {
  public messages: Subject<Message>;

  constructor() {
    
  }
}