import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { AuthenticationService } from '../services/authentication-service';
import { User } from '../model/User';

@Component({
  selector: 'app-user',
  templateUrl: './user.page.html',
  styleUrls: ['./user.page.scss'],
})
export class UserPage implements OnInit {

  public image64: string;
  private user: User;

  constructor(private userService: UserService, private authService: AuthenticationService ) {

   }

  ngOnInit() {
  }

  ionViewWillEnter(): void {
    this.authService.getUser().then(val => {
      if (JSON.parse(val)) {
        this.user = JSON.parse(val);
      }
    });
  }

  handleImage(event: any): void {
    let file = event.target.files[0];
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      this.image64 = reader.result.toString();
    };
  }

  uploadImage(): void {
    this.userService.uploadImageProfile(this.image64, this.user.userName).subscribe(res => {
      console.log(res);
    });
  }

}
