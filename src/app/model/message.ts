export interface Message {
    from: string;
    time: string;
    text: string | ArrayBuffer;
    type: string;
}
export interface MessageReceived {
    message: string;
    avatar: string;
    givenName: string;
    familyName: string;
    status: string;
    id: number;
    counter: number;
    connected: boolean;
}
export enum TypeMessages {
    TEXT = "text",
    AUDIO = "audio",
    IMAGE = "image",
    FILE_RECEIVED = "file sent to you"
}
