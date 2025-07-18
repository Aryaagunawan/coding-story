import { StoryDatabase } from '../../utils/database.js';
import { showToast } from '../../utils/api.js';

export default async function OfflineStoriesView() {
    try {
        const view = document.createElement('main');
        view.className = 'offline-stories-view';
        view.id = 'main-content';

        view.innerHTML = `
            <section class="offline-stories-container">
                <h1>Cerita Offline</h1>
                <div id="offlineStoriesList" class="stories-grid"></div>
                <button id="clearStoriesBtn" class="btn-danger">Hapus Semua Cerita Offline</button>
            </section>
        `;

        const db = new StoryDatabase();
        await db.openDB(); // Pastikan database terbuka sebelum operasi

        const stories = await db.getAllStories();
        const storiesList = view.querySelector('#offlineStoriesList');

        if (!stories || stories.length === 0) {
            storiesList.innerHTML = '<p class="empty-message">Tidak ada cerita offline</p>';
            return view;
        }

        // Render stories - Updated according to instructions
        stories.forEach(story => {
            const storyCard = document.createElement('article');
            storyCard.className = 'story-card';
            storyCard.innerHTML = `
                <img src="${story.photoUrl}" alt="${story.description}" class="story-image" 
                     onerror="this.onerror=null;this.src='/src/assets/default-story.jpg'">
                <div class="story-content">
                    <h3>${story.name}</h3>
                    <p class="story-description">${story.description}</p>
                    <div class="story-meta">
                        <span><i class="fas fa-calendar-alt"></i> ${new Date(story.createdAt).toLocaleDateString()}</span>
                    </div>
                    <button class="btn-danger delete-btn" data-id="${story.id}">Hapus</button>
                </div>
            `;
            storiesList.appendChild(storyCard);
        });

        // Event listeners for delete buttons
        view.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                if (confirm('Apakah Anda yakin ingin menghapus cerita ini?')) {
                    try {
                        const id = e.target.dataset.id;
                        await db.deleteStory(id);
                        showToast('Cerita dihapus', 'success');
                        e.target.closest('.story-card').remove();

                        if (view.querySelectorAll('.story-card').length === 0) {
                            storiesList.innerHTML = '<p class="empty-message">Tidak ada cerita offline</p>';
                        }
                    } catch (error) {
                        console.error('Error deleting story:', error);
                        showToast('Gagal menghapus cerita', 'error');
                    }
                }
            });
        });

        // Event listener for clear all button
        view.querySelector('#clearStoriesBtn').addEventListener('click', async () => {
            if (confirm('Apakah Anda yakin ingin menghapus semua cerita offline?')) {
                try {
                    await db.clearStories();
                    showToast('Semua cerita offline dihapus', 'success');
                    storiesList.innerHTML = '<p class="empty-message">Tidak ada cerita offline</p>';
                } catch (error) {
                    console.error('Error clearing stories:', error);
                    showToast('Gagal menghapus semua cerita', 'error');
                }
            }
        });

        return view;
    } catch (error) {
        console.error('Error in OfflineStoriesView:', error);
        showToast('Gagal memuat cerita offline', 'error');

        const errorView = document.createElement('div');
        errorView.className = 'error-view';
        errorView.innerHTML = `
            <p>Terjadi kesalahan saat memuat cerita offline</p>
            <button class="btn-retry" id="retryButton">Coba Lagi</button>
        `;

        // Add retry functionality
        errorView.querySelector('#retryButton').addEventListener('click', () => {
            window.location.reload();
        });

        return errorView;
    }
}