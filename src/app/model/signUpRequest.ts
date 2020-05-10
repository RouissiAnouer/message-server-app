export interface SignUpRequest {
    email: string;
    firstname: string;
    lastname: string;
    password: string;
    role: string;
}
export interface LogOutRequest {
    username: string;
}