import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../services/login.service';
import { SignUpRequest } from '../model/signUpRequest';
import { HttpEventType } from '@angular/common/http';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.page.html',
  styleUrls: ['./sign-up.page.scss'],
})
export class SignUpPage implements OnInit {

  public email: string;
  public firstname: string;
  public lastname: string;
  public password: string;

  constructor(private router: Router,
    private loginService: LoginService) { }

  ngOnInit() {
  }

  public signUp(): void {
    let signUpRequest: SignUpRequest = {
      email: this.email,
      password: this.password,
      firstname: this.firstname,
      lastname: this.lastname,
      role: 'ROLE_USER'
    };
    this.loginService.signUpUser(signUpRequest).subscribe(observer => {
      if (observer.type === HttpEventType.Sent) {
        console.log("loading...");
      } else if (observer.type === HttpEventType.Response) {
        this.router.navigate(['login']);
      }
    },
    err => {
      console.log(err);
    });
  }

}
