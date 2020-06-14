import { Component, OnInit, ViewChild, AfterViewInit, ElementRef, AfterViewChecked } from '@angular/core';
import { UserService } from '../services/user.service';
import { AuthenticationService } from '../services/authentication-service';
import { User, UserInfo } from '../model/User';
import { Router } from '@angular/router';
import { HttpEventType, HttpResponse, HttpEvent } from '@angular/common/http';
import { ToastController, MenuController } from '@ionic/angular';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-user',
  templateUrl: './user.page.html',
  styleUrls: ['./user.page.scss'],
})
export class UserPage {

  @ViewChild("imageInput", { static: true }) public imageInput: ElementRef;
  @ViewChild("coverInput", { static: true }) public coverInput: ElementRef;
  @ViewChild("userImage", { static: true }) public userImage: ElementRef;
  @ViewChild("userCover", { static: true }) public userCover: ElementRef;

  public image64: File;
  public user: User;
  public givenName: string;
  public familyName: string;
  public users: Array<UserInfo> = new Array<UserInfo>();

  constructor(private userService: UserService,
    private authService: AuthenticationService, private router: Router, private toastCtrl: ToastController, private storage: Storage,
    private menuCtrl: MenuController) { }

  ionViewWillEnter(): void {
    this.authService.getUser().then((user: User) => {
      this.menuCtrl.enable(true);
      this.getUserInfo(user.userName);
      this.getAllUsers(user.userName);
    })
  }

  public openProfile(user: UserInfo): void {
    this.getUserInfo(user.userName);
    this.getAllUsers(user.userName);
  }

  private getUserInfo(userName: string): void {
    this.userService.getUserInfo(userName).subscribe((data: any) => {
      if (data.type === HttpEventType.Sent) {
        console.log("loading...");
      } else if (data instanceof HttpResponse) {
        this.user = data.body;
        this.familyName = this.user.familyName;
        this.givenName = this.user.givenName;
        this.userImage.nativeElement.src = this.user.userAvatar ? this.user.userAvatar : "../../assets/icon/img_avatar2.png";
        this.userCover.nativeElement.src = this.user.cover ? this.user.cover : "../../assets/icon/img_avatar2.png";
      }
    }, err => {
      this.createToast(err.message, 'danger', 2000).then(toast => toast.present());
    })
  }

  private getAllUsers(username: string): void {
    this.userService.getAllUser(username).subscribe((data: HttpEvent<any>) => {
      if (data.type === HttpEventType.Sent) {
        console.log("loading...");
      } else if (data instanceof HttpResponse) {
        console.log("loading stop...");
        this.users = data.body;
        console.log(this.users);
      }
    }, err => {
      this.createToast(err.message, 'danger', 2000).then(toast => toast.present());
    });
  }

  handleImage(event: any): void {
    this.userService.uploadImageProfile(event.target.files[0], this.user.userName).subscribe(res => {
      this.getUserInfo(this.user.userName);
    });
  }

  uploadImage(): void {
    this.authService.getUser().then((user: User) => {
      if (user.userName === this.user.userName) {
        this.imageInput.nativeElement.click();
      }
    });
  }

  handleCover(event: any): void {
    this.userService.uploadImageCover(event.target.files[0], this.user.userName).subscribe(res => {
      this.getUserInfo(this.user.userName);
    });
  }

  uploadCover(): void {
    this.authService.getUser().then((user: User) => {
      if (user.userName === this.user.userName) {
        this.coverInput.nativeElement.click();
      }
    });
  }

  async createToast(message: string, color: string, duration: number, top?: boolean): Promise<HTMLIonToastElement> {
    return await this.toastCtrl.create({
      message: message,
      duration: duration,
      color: color,
      position: top ? "top" : "bottom"
    });
  }

}
