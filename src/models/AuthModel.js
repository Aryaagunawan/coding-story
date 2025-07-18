// src/models/AuthModel.js
import { AuthService } from '../utils/api.js';

export class AuthModel {
    static async login(email, password) {
        return AuthService.login(email, password);
    }

    static async register(name, email, password) {
        return AuthService.register(name, email, password);
    }

    static logout() {
        AuthService.logout();
    }
}