import {Logger} from '@nestjs/common';
export class AuthService {

    private static token: string;

    public static setToken(token: string) {
        if (!token) {
            Logger.error('AuthService.setToken(): No token set');
        }
        this.token = token;
    }

    public static getToken(): string {
        if (!this.token) {
            Logger.error('AuthService.getToken(): No token set');
        }

        return this.token;
    }
}