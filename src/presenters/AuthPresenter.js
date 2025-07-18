// src/presenters/AuthPresenter.js
import { AuthModel } from '../models/AuthModel.js';

export class AuthPresenter {
    constructor(view) {
        this.view = view;
    }

    async login(email, password) {
        try {
            await AuthModel.login(email, password);
            this.view.onLoginSuccess();
        } catch (error) {
            this.view.onLoginError(error.message);
        }
    }

    async register(name, email, password) {
        try {
            await AuthModel.register(name, email, password);
            this.view.onRegisterSuccess();
        } catch (error) {
            this.view.onRegisterError(error.message);
        }
    }

    logout() {
        AuthModel.logout();
        this.view.onLogoutSuccess();
    }
}