export interface ChatsResponse {
    sent: Array<Chats>;
    received: Array<Chats>;
}

export interface Chats {
    message: string;
    id: number;
    time: string;
    read?: boolean;
}


export interface ChatsList {
    userId: string;
    userAvatar: string;
    message: string;
    time: string;
    id: number;
}