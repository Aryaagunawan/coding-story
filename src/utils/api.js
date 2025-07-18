const BASE_URL = 'https://story-api.dicoding.dev/v1';

/* -------------------  STORY  SERVICE  -------------------- */
export class StoryService {
    static async getAllStories(page = 1, size = 10, withLocation = false) {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authentication token found');

        const url = new URL(`${BASE_URL}/stories`);
        url.searchParams.append('page', page);
        url.searchParams.append('size', size);
        if (withLocation) url.searchParams.append('location', 1);

        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const { message } = await response.json();
            throw new Error(message || 'Failed to fetch stories');
        }
        return response.json();
    }

    static async getStoryById(id) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${BASE_URL}/stories/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message);

        return data.story;
    }

    static async addStory(description, photoFile, lat = null, lon = null) {
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('description', description);
        formData.append('photo', photoFile);
        if (lat) formData.append('lat', lat);
        if (lon) formData.append('lon', lon);

        const response = await fetch(`${BASE_URL}/stories`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: formData
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message);

        return data;
    }
}

/* --------------------  AUTH  SERVICE  -------------------- */
export class AuthService {
    static async register(name, email, password) {
        const response = await fetch(`${BASE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message);

        return data;
    }

    static async login(email, password) {
        const response = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message);

        localStorage.setItem('token', data.loginResult.token);
        localStorage.setItem('user', JSON.stringify(data.loginResult));

        return data;
    }

    static logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }
}

/* ---------------  NOTIFICATION  SERVICE  ----------------- */
export class NotificationService {
    static async getPublicKey() {
        return 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk';
    }

    static async subscribe(subscription) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${BASE_URL}/notifications/subscribe`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(subscription)
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message);

        return data;
    }

    static async unsubscribe(endpoint) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${BASE_URL}/notifications/subscribe`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ endpoint })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message);

        return data;
    }

    static async sendNotification(notification) {
        if (!('serviceWorker' in navigator)) return;

        const registration = await navigator.serviceWorker.ready;
        registration.active.postMessage(JSON.stringify(notification));
    }

    static async requestPermission() {
        if (!('Notification' in window)) return false;
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }

    static async registerPushNotifications() {
        if (!('serviceWorker' in navigator)) return;

        const permission = await this.requestPermission();
        if (!permission) return;

        const registration = await navigator.serviceWorker.register('/sw.js');
        const publicKey = await this.getPublicKey();
        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: publicKey
        });

        await this.subscribe(subscription);
    }
}

/* ---------------------  SHOW  TOAST  ---------------------- */

export function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
}