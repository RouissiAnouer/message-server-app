import { Priority } from '@ionic-native/push/ngx';

export interface PushNotificationConfig {
    enablePushNotification: boolean,
    pushNotificationConfig: {
        DEVICE_PREFIX: string,
        CHANNEL_DESC: string,
        CHANNEL_ID: string,
        CHANNEL_IMPORTANCE: Priority,
        DEVICE_TYPE: {
            android: string,
            ios: string
        },
        ANDROID_CONFIG: {
            senderID: string,
            clearBadge: boolean,
            icon: string,
            iconColor: string,
            forceShow: boolean
        },
        IOS_CONFIG: {
            alert: string,
            badge: boolean,
            sound: string,
            clearBadge: boolean
        }
    }
}