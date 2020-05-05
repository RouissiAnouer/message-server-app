import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ModalChat } from './chat-modal';
import { ChatSocketService } from 'src/app/services/chat-socket.service';

@NgModule({
    declarations: [ModalChat],
    imports: [ CommonModule,
        FormsModule,
        IonicModule ],
    exports: [],
    providers: [DatePipe, ChatSocketService],
})
export class ChatPopupModule {}