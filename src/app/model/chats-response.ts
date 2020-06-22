export interface ChatsResponse {
    sent: Array<Chats>;
    received: Array<Chats>;
    avatar?: string;
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
    message: string | ArrayBuffer;
    time: string;
    id: number;
    type: string;
}