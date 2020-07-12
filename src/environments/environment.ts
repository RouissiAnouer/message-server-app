// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import { PushNotificationConfig } from 'src/app/model/push-config';

export const environment = {
  production: false,
  baseUrl: 'http://192.168.1.3:8088',
  socketUrl: '/chat',
  chatEndPoint: '/chats'
};

export const pushConfig: PushNotificationConfig = {
  enablePushNotification: true,
  pushNotificationConfig: {
    DEVICE_PREFIX: '',
    CHANNEL_DESC: 'My Messenger Channel',
    CHANNEL_ID: 'com.my.messenger',
    CHANNEL_IMPORTANCE: 1,
    DEVICE_TYPE: {
      android: 'FCM',
      ios: 'APNS'
    },
    ANDROID_CONFIG: {
      senderID: 'com.my.messenger',
      clearBadge: true,
      icon: 'ic_app_notification',
      iconColor: '#851714',
      forceShow: true
    },
    IOS_CONFIG: {
      alert: 'true',
      badge: false,
      sound: 'true',
      clearBadge: true
    }
  }
}

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
