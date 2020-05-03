import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ModalChat } from './chat-modal';

@NgModule({
    declarations: [ModalChat],
    imports: [ CommonModule,
        FormsModule,
        IonicModule ],
    exports: [],
    providers: [DatePipe],
})
export class ChatPopupModule {}