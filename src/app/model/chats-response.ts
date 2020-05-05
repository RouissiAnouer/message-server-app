export interface ChatsResponse {
    sent: Array<Chats>;
    received: Array<Chats>;
}

export interface Chats {
    message: string;
    id: number;
    time: string
}