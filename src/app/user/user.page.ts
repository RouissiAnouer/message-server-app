import { Component, OnInit, ViewChild, AfterViewInit, ElementRef, AfterViewChecked } from '@angular/core';
import { UserService } from '../services/user.service';
import { AuthenticationService } from '../services/authentication-service';
import { User } from '../model/User';
import { Router } from '@angular/router';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { ToastController } from '@ionic/angular';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-user',
  templateUrl: './user.page.html',
  styleUrls: ['./user.page.scss'],
})
export class UserPage {

  @ViewChild("imageInput", { static: true }) public imageInput: ElementRef;
  @ViewChild("userImage", { static: true }) public userImage: ElementRef;
  // @ViewChild("userImageCorporate", {static: true}) public imageCorp: ElementRef;

  public image64: File;
  public user: User;
  public givenName: string;
  public familyName: string;

  constructor(private userService: UserService,
    private authService: AuthenticationService, private router: Router, private toastCtrl: ToastController, private storage: Storage) {
      this.authService.getUser().then((user: User) => {
        this.getUserInfo(user.userName);
      })
    }

  private getUserInfo(userName: string): void {
    this.userService.getUserInfo(userName).subscribe((data: any) => {
      if (data.type === HttpEventType.Sent) {
        console.log("loading...");
      } else if (data instanceof HttpResponse) {
        this.user = data.body;
        this.familyName = this.user.familyName;
        this.givenName = this.user.givenName;
        if (this.user && this.user.userAvatar) {
          this.userImage.nativeElement.src = this.user.userAvatar;
          // this.imageCorp.nativeElement.src = this.user.userAvatar;
        } else {
          this.userImage.nativeElement.src = "../../assets/icon/img_avatar2.png";
          // this.imageCorp.nativeElement.src = "../../assets/icon/img_avatar2.png";
        }
      }
    }, err => {
      this.createToast(err.message, 'danger', 2000).then(toast => toast.present());
    })
  }

  handleImage(event: any): void {
    this.userService.uploadImageProfile(event.target.files[0], this.user.userName).subscribe(res => {
      this.getUserInfo(this.user.userName);
    });
  }

  uploadImage(): void {
    this.imageInput.nativeElement.click();
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
