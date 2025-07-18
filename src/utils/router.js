// src/utils/router.js

export class Router {
    constructor(routes) {
        this.routes = routes;
        this.defaultRoute = null;
    }

    setDefaultRoute(route) {
        this.defaultRoute = route;
    }

    async init() {
        window.addEventListener('hashchange', () => this.handleRoute());
        await this.handleRoute();
    }

    async handleRoute() {
        const path = window.location.hash.substr(1) || this.defaultRoute;
        const app = document.getElementById('app');

        // Find matching route
        let routeMatch = null;
        let params = {};

        for (const route in this.routes) {
            const routePattern = route.replace(/:\w+/g, '([^/]+)');
            const regex = new RegExp(`^${routePattern}$`);
            const match = path.match(regex);

            if (match) {
                routeMatch = route;
                const paramNames = route.match(/:\w+/g) || [];
                paramNames.forEach((name, index) => {
                    params[name.substr(1)] = match[index + 1];
                });
                break;
            }
        }

        if (routeMatch) {
            const view = this.routes[routeMatch];
            // Tambahkan "oldView" untuk mendukung transisi tampilan jika diperlukan di masa depan.
            // Saat ini, fokus utama adalah perbaikan skip-link.
            // Jika ada logika cleanup() pada view, bisa dipanggil di sini.
            const viewInstance = await (typeof view === 'function' ? view(params) : view);
            app.innerHTML = '';
            app.appendChild(viewInstance);

            // Focus management - skip link
            const skipLink = document.querySelector('.skip-link');
            if (skipLink) {
                skipLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    const mainContent = document.getElementById('main-content');
                    if (mainContent) {
                        mainContent.setAttribute('tabindex', '-1');
                        mainContent.focus();
                    }
                });
            }

            // Focus to main content after route change

            setTimeout(() => {
                const mainContent = document.getElementById('main-content');
                if (mainContent) {
                    mainContent.setAttribute('tabindex', '-1');
                    mainContent.focus();
                }
            }, 100);
        } else {
            window.location.hash = this.defaultRoute;
        }
    }
}