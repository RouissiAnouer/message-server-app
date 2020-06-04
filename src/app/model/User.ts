export interface User {
    expiredIn: number;
    token: string;
    givenName: string;
    familyName: string;
    userName: string;
    tokenType: string;
    id: number;
    userAvatar: string;
}
export interface UserInfo extends Document {
    givenName: string;
    familyName: string;
    userName: string;
    id: number;
    sent: Array<Chats>;
    received: Array<Chats>;
    userAvatar: string;
}
export interface Chats {
    id: number;
    idReceiver: number;
    idSender: number;
    message: string;
    time: string;
    read?:boolean;
}