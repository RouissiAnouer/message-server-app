import { Storage } from '@ionic/storage';
import { Component, Input, ViewChild, AfterViewChecked, ElementRef, Type, AfterViewInit } from '@angular/core';
import { User, Chats } from 'src/app/model/User';
import { ModalController, NavParams, IonContent, Platform, ActionSheetController } from '@ionic/angular';
import { DatePipe } from '@angular/common';
import { ChatSocketService } from 'src/app/services/chat-socket.service';
import { Message, TypeMessages } from 'src/app/model/message';
import { StompHeaders } from '@stomp/stompjs';
import { ChatsList } from 'src/app/model/chats-response';
import { ChatService } from 'src/app/services/chat.service';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { UserService } from 'src/app/services/user.service';
import { DomSanitizer } from '@angular/platform-browser';
import { Media, MediaObject } from "@ionic-native/media/ngx";
import { File, FileSaver, FileEntry } from "@ionic-native/file/ngx";
import { MediaCapture, CaptureVideoOptions, MediaFile, CaptureError } from "@ionic-native/media-capture/ngx";
import { ImagePicker } from "@ionic-native/image-picker/ngx";
import { Timestamp } from 'rxjs/internal/operators/timestamp';

const MEDIA_FILES_KEY = "mediaFiles";
const MEDIA_FOLDER = "mediaFolder";
const audioExtension: string = "data:audio/wav";
const iosAudioExtension: string = "data:audio/vnd.wave";
const iosVideoExtension: string = "data:video/quicktime";
const videoExtension: string = "data:video/mp4";

@Component({
    selector: 'modal-page',
    templateUrl: './chat.modal.html',
    styleUrls: ['./chat.modal.scss'],
})
export class ModalChat {

    @ViewChild('IonContent', { static: false }) content: IonContent;
    @ViewChild("cameraInput", { static: true }) public imageInput: ElementRef;
    @ViewChild("audioInput", { static: true }) public audioInput: ElementRef;
    @ViewChild("videoInput", { static: true }) public videoInput: ElementRef;

    @Input() receiver: number;
    @Input() userInput: string;
    public user: User;
    public msgList: Array<ChatsList> = new Array<ChatsList>();
    public greetings: string[] = [];
    public sent: Array<Chats>;
    public received: Array<Chats>;
    public friendAvatar: string;
    public recording: boolean;
    public mediaFiles: Array<any> = [];

    constructor(private modalCtrl: ModalController,
        private params: NavParams,
        private datePipe: DatePipe,
        private storage: Storage,
        private chatService: ChatService,
        private socketService: ChatSocketService,
        private userService: UserService,
        private domSanitizer: DomSanitizer,
        private media: Media,
        private file: File,
        private mediaCapture: MediaCapture,
        private platform: Platform,
        private actionSheet: ActionSheetController,
        private imagePicker: ImagePicker) {
        this.storage.get('user').then(val => {
            this.user = JSON.parse(val);
            this.userService.getUserInfo(this.user.userName).subscribe((res: any) => {
                if (res instanceof HttpResponse) {
                    this.getPage();
                }
            })

        });

        this.sent = this.params.get('sent');
        this.received = this.params.get('received');
        this.friendAvatar = this.params.get("avatar");
    }

    getPage(): void {
        let unReadMessages: Array<number> = new Array<number>();
        this.received.forEach(msg => {
            let message: any = msg.message;
            switch (msg.type) {
                case TypeMessages.IMAGE: message = this.domSanitizer.bypassSecurityTrustUrl(msg.message); break;
                case TypeMessages.AUDIO: {
                    if (!this.platform.is("ios") && msg.message.indexOf(iosAudioExtension) !== -1) {
                        message = audioExtension.concat(msg.message.substr(iosAudioExtension.length, msg.message.length));
                    } else if (this.platform.is("ios") && msg.message.indexOf(audioExtension) !== -1) {
                        message = iosAudioExtension.concat(msg.message.substr(audioExtension.length, msg.message.length));
                    }
                    message = this.domSanitizer.bypassSecurityTrustUrl(message);
                }; break;
                case TypeMessages.VIDEO: {
                    if (message.indexOf(iosVideoExtension) !== -1) {
                        message = videoExtension.concat(msg.message.substr(iosVideoExtension.length, msg.message.length));
                    }
                    message = this.domSanitizer.bypassSecurityTrustUrl(message);
                }; break;
            }
            let obj: ChatsList = {
                message: message,
                time: msg.time,
                userAvatar: this.friendAvatar,
                userId: 'User',
                id: msg.id,
                type: msg.type
            };
            if (!msg.read) {
                unReadMessages.push(msg.id);
            }
            this.msgList.push(obj);
        });
        if (unReadMessages.length > 0) {
            this.updateChat(unReadMessages);
        }
        this.sent.forEach(msg => {
            let message: any = msg.message;
            switch (msg.type) {
                case TypeMessages.IMAGE: message = this.domSanitizer.bypassSecurityTrustUrl(msg.message); break;
                case TypeMessages.AUDIO: {
                    if (!this.platform.is("ios") && msg.message.indexOf(iosAudioExtension) !== -1) {
                        message = audioExtension.concat(msg.message.substr(iosAudioExtension.length, msg.message.length));
                    } else if (this.platform.is("ios") && msg.message.indexOf(audioExtension) !== -1) {
                        message = iosAudioExtension.concat(msg.message.substr(audioExtension.length, msg.message.length));
                    }
                    message = this.domSanitizer.bypassSecurityTrustUrl(message);
                }; break;
                case TypeMessages.VIDEO: {
                    if (message.indexOf(iosVideoExtension) !== -1) {
                        message = videoExtension.concat(msg.message.substr(iosVideoExtension.length, msg.message.length));
                    }
                    message = this.domSanitizer.bypassSecurityTrustUrl(message);
                }; break;
            }
            let obj: ChatsList = {
                message: message,
                time: msg.time,
                userAvatar: this.user.userAvatar,
                userId: 'toUser',
                id: msg.id,
                type: msg.type
            };
            this.msgList.push(obj);
        });
        let array = this.msgList.sort((a, b) => a.time - b.time);
        this.msgList = [];
        array.forEach(item => {
            this.msgList.push(item);
        });
        setTimeout(() => {
            this.content.scrollToBottom(250);
        }, 400);
        this.connectSocket(this.user.id);
        if (this.platform.is('ios') || this.platform.is('android')) {
            this.checkFile();
        }
    }

    async selectAudioOption() {
        const actionSheet = await this.actionSheet.create({
            header: 'What do you like to choose ?',
            buttons: [
                {
                    text: 'Capture Audio',
                    handler: () => {
                        if (this.platform.is('ios') || this.platform.is('android')) {
                            this.captureAudio();
                        } else {
                            this.openAudioLoader();
                        }
                    }
                },
                {
                    text: 'Cancel',
                    handler: () => {
                        actionSheet.dismiss();
                    }
                }
            ]
        });
        await actionSheet.present();
    }

    async selectVideoOption() {
        const actionSheet = await this.actionSheet.create({
            header: 'What do you like to choose ?',
            buttons: [
                {
                    text: 'Capture Video',
                    handler: () => {
                        if (this.platform.is('ios') || this.platform.is('android')) {
                            this.captureVideo();
                        } else {
                            this.openVideoLoader();
                        }
                    }
                },
                {
                    text: 'Capture Image',
                    handler: () => {
                        this.captureImage();
                    }
                },
                {
                    text: 'Pick Image From Foto Library',
                    handler: () => {
                        if (this.platform.is('ios') || this.platform.is('android')) {
                            this.pickImage();
                        } else {
                            this.openImageLoader();
                        }
                    }
                },
                {
                    text: 'Cancel',
                    handler: () => {
                        actionSheet.dismiss();
                    }
                }
            ]
        });
        await actionSheet.present();
    }

    pickImage(): void {
        this.imagePicker.getPictures({}).then((data: Array<string>) => {
            if (data.length > 0) {
                console.log(data);
                for (let i = 0; i < data.length; i++) {
                    let path = data[i];
                    let myPath: string = path;
                    if (path.indexOf('file://') < 0) {
                        myPath = 'file://' + path;
                    }
                    const ext = myPath.split('.').pop();
                    const d = Date.now();
                    const newName = `${d}.${ext}`;
                    const name = myPath.substr(myPath.lastIndexOf('/') + 1);
                    const copyFrom = myPath.substr(0, myPath.lastIndexOf('/') + 1);
                    const copyTo = this.file.dataDirectory + MEDIA_FOLDER;

                    this.file.copyFile(copyFrom, name, copyTo, newName).then(() => {
                        this.file.readAsDataURL(copyTo, newName).then(base64 => {
                            this.sendImage(base64);
                        }, err => {
                            console.log(err);
                            this.file.removeFile(copyTo, newName);
                        }).finally(() => {
                            this.file.removeFile(copyTo, newName);
                        });
                    });
                }
            }
        }, (err: CaptureError) => {
            console.log(err);
        });
    }

    captureVideo(): void {
        this.mediaCapture.captureVideo().then((data: MediaFile[]) => {
            if (data.length > 0) {
                let path = data[0].fullPath;
                let myPath: string = path;
                if (path.indexOf('file://') < 0) {
                    myPath = 'file://' + path;
                }
                const ext = myPath.split('.').pop();
                const d = Date.now();
                const newName = `${d}.${ext}`;
                const name = myPath.substr(myPath.lastIndexOf('/') + 1);
                const copyFrom = myPath.substr(0, myPath.lastIndexOf('/') + 1);
                const copyTo = this.file.dataDirectory + MEDIA_FOLDER;

                this.file.copyFile(copyFrom, name, copyTo, newName).then(() => {
                    this.file.readAsDataURL(copyTo, newName).then(base64 => {
                        this.sendVideo(base64);
                    }, err => {
                        console.log(err);
                        this.file.removeFile(copyTo, newName);
                    }).finally(() => {
                        this.file.removeFile(copyTo, newName);
                    });
                });
            }
        }, (err: CaptureError) => {
            console.log(err);
        });
    }

    captureImage(): void {
        this.mediaCapture.captureImage().then((data: MediaFile[]) => {
            if (data.length > 0) {
                let path = data[0].fullPath;
                let myPath: string = path;
                if (path.indexOf('file://') < 0) {
                    myPath = 'file://' + path;
                }
                const ext = myPath.split('.').pop();
                const d = Date.now();
                const newName = `${d}.${ext}`;
                const name = myPath.substr(myPath.lastIndexOf('/') + 1);
                const copyFrom = myPath.substr(0, myPath.lastIndexOf('/') + 1);
                const copyTo = this.file.dataDirectory + MEDIA_FOLDER;

                this.file.copyFile(copyFrom, name, copyTo, newName).then(() => {
                    this.file.readAsDataURL(copyTo, newName).then(base64 => {
                        this.sendImage(base64);
                    }, err => {
                        console.log(err);
                        this.file.removeFile(copyTo, newName);
                    }).finally(() => {
                        this.file.removeFile(copyTo, newName);
                    });
                });
            }
        }, (err: CaptureError) => {
            console.log(err);
        });
    }

    captureAudio(): void {
        this.mediaCapture.captureAudio().then((data: MediaFile[]) => {
            if (data.length > 0) {
                let path = data[0].fullPath;
                let myPath: string = path;
                if (path.indexOf('file://') < 0) {
                    myPath = 'file://' + path;
                }
                const ext = myPath.split('.').pop();
                const d = Date.now();
                const newName = `${d}.${ext}`;
                const name = myPath.substr(myPath.lastIndexOf('/') + 1);
                const copyFrom = myPath.substr(0, myPath.lastIndexOf('/') + 1);
                const copyTo = this.file.dataDirectory + MEDIA_FOLDER;

                this.file.copyFile(copyFrom, name, copyTo, newName).then(() => {
                    this.file.readAsDataURL(copyTo, newName).then(base64 => {
                        this.sendAudio(base64);
                    }, err => {
                        console.log(err);
                        this.file.removeFile(copyTo, newName);
                    }).finally(() => {
                        this.file.removeFile(copyTo, newName);
                    });
                });
            }
        }, (err: CaptureError) => {
            console.log(err);
        });
    }


    private checkFile(): void {
        this.platform.ready().then(() => {
            let path: string = this.file.dataDirectory;
            this.file.checkDir(path, MEDIA_FOLDER).then(res => {
            }, err => {
                this.file.createDir(path, MEDIA_FOLDER, true).then(() => {
                });

            })
        });
    }

    dismiss() {
        this.socketService.disconnect();
        this.modalCtrl.dismiss({
            'dismissed': true
        });
    }

    async updateChat(unReadMessages: Array<number>): Promise<any> {
        this.chatService.updateChatStatus(unReadMessages).subscribe(response => {
            if (response.type === HttpEventType.Sent) {
                console.log('loading ...');
            } else if (response.type === HttpEventType.Response) {
                console.log(response);
            }
        });
    }

    connectSocket(owner: number): void {
        this.socketService.onMessage('/topic/reply.' + owner).subscribe(message => {
            this.showGreeting(message);
        });
    }

    showGreeting(message) {
        let newTime: any = this.datePipe.transform(message.time, 'MMM d, y, h:mm:ss a');
        switch (message.type) {
            case TypeMessages.IMAGE: message.text = this.domSanitizer.bypassSecurityTrustUrl(message.text); break;
            case TypeMessages.AUDIO: {
                if (!this.platform.is("ios") && message.text.indexOf(iosAudioExtension) !== -1) {
                    message.text = audioExtension.concat(message.text.substr(iosAudioExtension.length, message.text.length));
                }
                else if (this.platform.is("ios") && message.text.indexOf(audioExtension) !== -1) {
                    message.text = iosAudioExtension.concat(message.text.substr(audioExtension.length, message.text.length));
                }
                message = this.domSanitizer.bypassSecurityTrustUrl(message);
            }; break;
            case TypeMessages.VIDEO: {
                if (message.text.indexOf(iosVideoExtension) !== -1) {
                    message.text = videoExtension.concat(message.text.substr(iosVideoExtension.length, message.text.length));
                }
                message.text = this.domSanitizer.bypassSecurityTrustUrl(message.text);
            }; break;
        }
        if (message.from === this.receiver.toString()) {
            this.updateChat([message.id]);
            let obj: ChatsList = {
                message: message.text,
                time: newTime,
                userAvatar: this.user.userAvatar,
                userId: 'User',
                id: message.id,
                type: message.type
            };
            this.msgList.push(obj);
            this.greetings.push(message)
            setTimeout(() => {
                this.content.scrollToBottom(500);
            }, 10);
        }
    }

    orderSentMessage(now: number, type?: string, message?: any): void {
        let newTime: any = this.datePipe.transform(now, 'MMM d, y, h:mm:ss a');
        switch (type) {
            case TypeMessages.IMAGE: message = this.domSanitizer.bypassSecurityTrustUrl(message); break;
            case TypeMessages.AUDIO: {
                if (!this.platform.is("ios") && message.indexOf(iosAudioExtension) !== -1) {
                    message = audioExtension.concat(message.substr(iosAudioExtension.length, message.length));
                }
                else if (this.platform.is("ios") && message.indexOf(audioExtension) !== -1) {
                    message = iosAudioExtension.concat(message.substr(audioExtension.length, message.length));
                }
                message = this.domSanitizer.bypassSecurityTrustUrl(message);
            }; break;
            case TypeMessages.VIDEO: {
                if (message.indexOf(iosVideoExtension) !== -1) {
                    message = videoExtension.concat(message.substr(iosVideoExtension.length, message.length));
                }
                message = this.domSanitizer.bypassSecurityTrustUrl(message);
            }; break;
        }
        let obj: ChatsList = {
            message: message === undefined ? this.userInput : message,
            time: newTime,
            userAvatar: this.user.userAvatar,
            userId: 'toUser',
            type: type === undefined ? TypeMessages.TEXT : type
        };
        this.msgList.push(obj);
        let array = this.msgList.sort((a, b) => a.time - b.time);
        this.msgList = [];
        array.forEach(item => {
            this.msgList.push(item);
        })
        this.userInput = '';
        setTimeout(() => {
            this.content.scrollToBottom(500);
        }, 10);
    }

    sendMessageTo(message?: string) {
        let headers: StompHeaders = {
            'Authorization': this.user.tokenType + ' ' + this.user.token,
            'Content-Type': 'application/json'
        }
        let now = new Date().getTime();
        let data: Message = {
            from: this.user.id.toString(),
            text: message === undefined ? this.userInput : message,
            time: now,
            type: TypeMessages.TEXT
        };
        this.socketService.send('/send/message/' + this.receiver, data, headers);
        this.orderSentMessage(now);
    }

    private sendImage(image64: string | ArrayBuffer): void {
        let headers: StompHeaders = {
            'Authorization': this.user.tokenType + ' ' + this.user.token,
            'Content-Type': 'application/json'
        }
        let now = new Date().getTime();
        let data: Message = {
            from: this.user.id.toString(),
            text: image64,
            time: now,
            type: TypeMessages.IMAGE
        };
        this.socketService.send('/send/image/' + this.receiver, data, headers);
        this.orderSentMessage(now, TypeMessages.IMAGE, image64);
    }

    private sendAudio(image64: string | ArrayBuffer): void {
        let headers: StompHeaders = {
            'Authorization': this.user.tokenType + ' ' + this.user.token,
            'Content-Type': 'application/json'
        }
        let now = new Date().getTime();
        let data: Message = {
            from: this.user.id.toString(),
            text: image64,
            time: now,
            type: TypeMessages.AUDIO
        };
        this.socketService.send('/send/audio/' + this.receiver, data, headers);
        this.orderSentMessage(now, TypeMessages.AUDIO, image64);
    }

    private sendVideo(image64: string | ArrayBuffer): void {
        let headers: StompHeaders = {
            'Authorization': this.user.tokenType + ' ' + this.user.token,
            'Content-Type': 'application/json'
        }
        let now = new Date().getTime();
        let data: Message = {
            from: this.user.id.toString(),
            text: image64,
            time: now,
            type: TypeMessages.VIDEO
        };
        this.socketService.send('/send/video/' + this.receiver, data, headers);
        this.orderSentMessage(now, TypeMessages.VIDEO, image64);
    }

    public openImageLoader(): void {
        this.imageInput.nativeElement.click();
    }

    public openAudioLoader(): void {
        this.audioInput.nativeElement.click();
    }

    public openVideoLoader(): void {
        this.videoInput.nativeElement.click();
    }

    handleImage(event: any): void {
        let image = event.target.files[0];
        let reader = new FileReader();
        reader.readAsDataURL(image);
        reader.onload = () => {
            console.log(reader.result.toString());
            this.sendImage(reader.result);
        }
    }

    handleAudio(event: any): void {
        let image = event.target.files[0];
        let reader = new FileReader();
        reader.readAsDataURL(image);
        reader.onload = () => {
            console.log(reader.result.toString());
            this.sendAudio(reader.result);
        }
    }

    handleVideo(event: any): void {
        let image = event.target.files[0];
        let reader = new FileReader();
        reader.readAsDataURL(image);
        reader.onload = () => {
            console.log(reader.result.toString());
            this.sendVideo(reader.result);
        }
    }


}