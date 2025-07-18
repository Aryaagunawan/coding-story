// Tambahkan error handling
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
        const stories = await db.getAllStories().catch(err => {
            console.error('Error getting stories:', err);
            return [];
        });

        const storiesList = view.querySelector('#offlineStoriesList');

        if (!stories || stories.length === 0) {
            storiesList.innerHTML = '<p class="empty-message">Tidak ada cerita offline</p>';
            return view;
        }

        // Render stories
        stories.forEach(story => {
            const storyCard = document.createElement('article');
            storyCard.className = 'story-card';
            storyCard.innerHTML = `
                <img src="${story.photoUrl}" alt="${story.description}" class="story-image">
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

        // Event listeners
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
        const errorView = document.createElement('div');
        errorView.innerHTML = '<p>Terjadi kesalahan saat memuat cerita offline</p>';
        return errorView;
    }
}