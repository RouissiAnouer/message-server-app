export interface SocketEvent {
    item: any;
    event: string;
}

export const SOCKET_EVENTS: any = {
    MESSAGE: 'message',
    USER_ENTERED: 'userentered',
    USER_LEAVE: 'userleave',
    IS_TYPING: 'istyping',
    USER_JOIN: 'userjoin',
    RECONNECT: 'reconnect',
    DISCONNECT: 'disconnect',
    USER_LEAVE_ROOM: 'userleaveroom'
};