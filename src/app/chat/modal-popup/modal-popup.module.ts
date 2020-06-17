import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ModalChat } from './chat-modal';
import { ChatSocketService } from 'src/app/services/chat-socket.service';
import { Media } from "@ionic-native/media/ngx";
import { File } from "@ionic-native/file/ngx";
import { MediaCapture } from '@ionic-native/media-capture/ngx';

@NgModule({
    declarations: [ModalChat],
    imports: [CommonModule,
        FormsModule,
        IonicModule],
    exports: [],
    providers: [DatePipe, ChatSocketService, Media, File, MediaCapture],
})
export class ChatPopupModule { }