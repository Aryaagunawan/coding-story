export default async function NotFoundView() {
    const view = document.createElement('main');
    view.className = 'not-found-view';
    view.id = 'main-content';

    view.innerHTML = `
        <section class="not-found-container">
            <h1>404 - Page Not Found</h1>
            <p>The page you're looking for doesn't exist or has been moved.</p>
            <a href="#/stories" class="btn-primary">Back to Home</a>
        </section>
    `;

    return view;
}