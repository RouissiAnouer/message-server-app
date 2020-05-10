import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ChatPageRoutingModule } from './chat-routing.module';

import { ChatPage } from './chat.page';
import { ModalChat } from './modal-popup/chat-modal';
import { ChatPopupModule } from './modal-popup/modal-popup.module';
import { ChatSocketService } from '../services/chat-socket.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ChatPageRoutingModule,
    ChatPopupModule
  ],
  declarations: [ChatPage],
  entryComponents: [ModalChat],
  providers: [ChatSocketService]
})
export class ChatPageModule {}
