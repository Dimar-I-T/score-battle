export interface AuthType {
    username: string;
    password: string;
}

export interface JWTPayload {
    user_id: string,
    username: string,
}