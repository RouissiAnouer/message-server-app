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

const MEDIA_FILES_KEY = "mediaFiles";
const MEDIA_FOLDER = "mediaFolder";

@Component({
    selector: 'modal-page',
    templateUrl: './chat.modal.html',
    styleUrls: ['./chat.modal.scss'],
})
export class ModalChat {

    @ViewChild('IonContent', { static: false }) content: IonContent;
    @ViewChild("cameraInput", { static: true }) public imageInput: ElementRef;
    @ViewChild("audioInput", { static: true }) public audioInput: ElementRef;

    @Input() receiver: number;
    @Input() userInput: string;
    public user: User;
    public msgList: Array<ChatsList> = new Array<ChatsList>();
    public greetings: string[] = [];
    public count: number = 0;
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
                    // this.user = res.body;
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
            let message: any;
            if (msg.type !== TypeMessages.TEXT) {
                message = this.domSanitizer.bypassSecurityTrustUrl(msg.message);
                console.log(msg.message);
            } else {
                message = msg.message;
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
            let message: any;
            if (msg.type !== TypeMessages.TEXT) {
                message = this.domSanitizer.bypassSecurityTrustUrl(msg.message);
                console.log(msg.message);
            } else {
                message = msg.message;
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
        let array = this.msgList.sort((a, b) => a.id - b.id);
        this.msgList = [];
        array.forEach(item => {
            this.msgList.push(item);
        });
        if (array.length > 0) {
            this.count = this.msgList[this.msgList.length - 1].id;
        }
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
                        this.captureVideo();
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
                // this.copyFileToLocalDir(data[0].fullPath);
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
                this.loadFiles();
            }, err => {
                this.file.createDir(path, MEDIA_FOLDER, true).then(() => {
                    this.loadFiles();
                });

            })
        });
    }

    loadFiles(): void {
        this.file.listDir(this.file.dataDirectory, MEDIA_FOLDER).then((res: FileEntry[]) => {
            this.mediaFiles = res;
            console.log('files :', res);
        });
    }

    dismiss() {
        this.socketService.disconnect();
        this.modalCtrl.dismiss({
            'dismissed': true
        });
    }

    showGreeting(message) {
        if (message.type !== TypeMessages.TEXT) {
            message.text = this.domSanitizer.bypassSecurityTrustUrl(message.text);
        }
        if (message.from === this.receiver.toString()) {
            this.updateChat([message.id]);
            let obj: ChatsList = {
                message: message.text,
                time: message.time,
                userAvatar: this.user.userAvatar,
                userId: 'User',
                id: message.id,
                type: message.type
            };
            this.count = message.id;
            this.msgList.push(obj);
            this.greetings.push(message)
            setTimeout(() => {
                this.content.scrollToBottom(500);
            }, 10);
        }
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

    sendMessageTo(message?: string) {
        let headers: StompHeaders = {
            'Authorization': this.user.tokenType + ' ' + this.user.token,
            'Content-Type': 'application/json'
        }
        let now = this.datePipe.transform(new Date(), 'MMM d, y, h:mm:ss a');
        let data: Message = {
            from: this.user.id.toString(),
            text: message === undefined ? this.userInput : message,
            time: now,
            type: TypeMessages.TEXT
        };
        this.socketService.send('/send/message/' + this.receiver, data, headers);
        this.orderSentMessage(now);
    }

    connectSocket(owner: number): void {
        this.socketService.onMessage('/topic/reply.' + owner).subscribe(message => {
            this.showGreeting(message);
        });
    }

    orderSentMessage(now: string, type?: string, message?: any): void {
        if ((type === TypeMessages.AUDIO) || (type === TypeMessages.IMAGE)) {
            message = this.domSanitizer.bypassSecurityTrustUrl(message);
        }
        let obj: ChatsList = {
            message: message === undefined ? this.userInput : message,
            time: now,
            userAvatar: this.user.userAvatar,
            userId: 'toUser',
            id: this.count++,
            type: type === undefined ? TypeMessages.TEXT : type
        };
        this.msgList.push(obj);
        let array = this.msgList.sort((a, b) => a.id - b.id);
        this.msgList = [];
        array.forEach(item => {
            this.msgList.push(item);
        })
        this.userInput = '';
        setTimeout(() => {
            this.content.scrollToBottom(500);
        }, 10);
    }

    private sendImage(image64: string | ArrayBuffer): void {
        let headers: StompHeaders = {
            'Authorization': this.user.tokenType + ' ' + this.user.token,
            'Content-Type': 'application/json'
        }
        let now = this.datePipe.transform(new Date(), 'MMM d, y, h:mm:ss a');
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
        let now = this.datePipe.transform(new Date(), 'MMM d, y, h:mm:ss a');
        let data: Message = {
            from: this.user.id.toString(),
            text: image64,
            time: now,
            type: TypeMessages.AUDIO
        };
        this.socketService.send('/send/audio/' + this.receiver, data, headers);
        this.orderSentMessage(now, TypeMessages.AUDIO, image64);
    }

    public openImageLoader(): void {
        this.imageInput.nativeElement.click();
    }

    public openAudioLoader(): void {
        this.audioInput.nativeElement.click();
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

    ionViewDidLoad() {
        this.storage.get(MEDIA_FILES_KEY).then(res => {
            this.mediaFiles = JSON.parse(res) || [];
        });
    }

    getNativePathFile(file: FileEntry): string {
        const path = file.nativeURL.replace(/^file:\/\//, '');
        return path;
    }

    play(file: FileEntry): void {
        console.log(file);
        if (file.name.indexOf('.wav') > -1) {
            const path = file.nativeURL.replace(/^file:\/\//, '');
            const audioFile: MediaObject = this.media.create(path);
            audioFile.play();
        } else {
            console.info("it's a video");
        }
    }

}