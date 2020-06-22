import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy, AnimationBuilder } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Interceptor } from './services/http.interceptor';
import { IonicStorageModule } from '@ionic/storage';
import { AuthenticationService } from './services/authentication-service';
import { CustomFormatPipe } from './pipe/custom-format.pipe';

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [BrowserModule, IonicModule.forRoot({
      backButtonText: 'Go Back',
      mode: 'ios'
  }), AppRoutingModule, FormsModule, HttpClientModule, IonicStorageModule.forRoot()
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: HTTP_INTERCEPTORS, useClass: Interceptor, multi: true },
    AuthenticationService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
