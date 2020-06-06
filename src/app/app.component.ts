import { Component } from '@angular/core';

import { Platform, MenuController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { AuthenticationService } from './services/authentication-service';
import { LoginService } from './services/login.service';
import { ChatSocketService } from './services/chat-socket.service';
import { User } from './model/User';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  
  public navigate : any;

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private authService: AuthenticationService,
    private loginService: LoginService,
    private socketService: ChatSocketService,
    private menuCtrl: MenuController
  ) {
    this.initializeApp();
    this.sideMenu();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      this.menuCtrl.enable(false);
    });
  }

  sideMenu()
  {
    this.navigate =
    [
      {
        title : "Home",
        url   : "",
        icon  : "home"
      },
      {
        title : "Chat",
        url   : "/chat",
        icon  : "chatbubbles"
      },
      {
        title : "Profile",
        url   : "/user",
        icon  : "person"
      },
    ]
  }

  public logout(): void {
    this.menuCtrl.close().then(() => {
      this.menuCtrl.enable(false);
    });
    this.authService.getUser().then((resp: User) => {
      this.loginService.logout({username: resp.userName}).subscribe(() => {
        this.socketService.disconnect();
        this.authService.logout();
      })
    })
  }
}
