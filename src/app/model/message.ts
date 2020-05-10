export interface Message {
    from: string;
    time: string;
    text: string;
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
