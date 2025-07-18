import { LoginView } from './views/auth/login.js';
import { RegisterView } from './views/auth/register.js';
import { Navbar } from './views/components/navbar.js';
import { StoryListView } from './views/stories/list.js';
import { StoryDetailView } from './views/stories/detail.js';
import { AddStoryView } from './views/stories/add.js';
import { Footer } from './views/components/footer.js';
import { AuthService, StoryService, NotificationService, showToast } from '../utils/api.js';

class DicodingStoryApp {
    constructor() {
        this._setupEventListeners();
        this._checkAuthState();
        this._setupServiceWorker();
        this._setupViewTransitions();
    }

    _setupEventListeners() {
        window.addEventListener('hashchange', () => this._renderPage());
        document.addEventListener('DOMContentLoaded', () => this._renderPage());
    }

    _checkAuthState() {
        const token = localStorage.getItem('token');
        if (token && (window.location.hash === '#/login' || window.location.hash === '#/register' || window.location.hash === '')) {
            window.location.hash = '#/stories';
        } else if (!token && !['#/login', '#/register'].includes(window.location.hash)) {
            window.location.hash = '#/login';
        }
    }

    _setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('ServiceWorker registration successful');
                })
                .catch(err => {
                    console.log('ServiceWorker registration failed: ', err);
                });
        }
    }

    _setupViewTransitions() {
        if (!document.startViewTransition) {
            document.startViewTransition = (callback) => callback();
            return;
        }
    }

    async _renderPage() {
        const mainContent = document.querySelector('#app');
        const hash = window.location.hash || '#/login';

        // Start view transition
        document.startViewTransition(async () => {
            mainContent.innerHTML = '';

            if (hash === '#/login') {
                mainContent.appendChild(await LoginView());
            } else if (hash === '#/register') {
                mainContent.appendChild(await RegisterView());
            } else if (hash === '#/stories') {
                mainContent.appendChild(await Navbar());
                mainContent.appendChild(await StoryListView());
                mainContent.appendChild(await Footer());
            } else if (hash.startsWith('#/stories/')) {
                const id = hash.split('/')[2];
                mainContent.appendChild(await Navbar());
                mainContent.appendChild(await StoryDetailView(id));
                mainContent.appendChild(await Footer());
            } else if (hash === '#/add-story') {
                mainContent.appendChild(await Navbar());
                mainContent.appendChild(await AddStoryView());
                mainContent.appendChild(await Footer());
            } else {
                window.location.hash = '#/login';
            }

            // Set focus to main content after render
            setTimeout(() => {
                const mainContentElement = document.getElementById('main-content');
                if (mainContentElement) {
                    mainContentElement.focus();
                }
            }, 100);
        });
    }
}

new DicodingStoryApp();