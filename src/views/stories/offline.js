import { StoryDatabase } from '../../utils/database.js';
import { showToast } from '../../utils/api.js';

export default async function OfflineStoriesView() {
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
    const stories = await db.getAllStories();

    const storiesList = view.querySelector('#offlineStoriesList');

    if (stories.length === 0) {
        storiesList.innerHTML = '<p class="empty-message">Tidak ada cerita offline</p>';
    } else {
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
    }

    // Tambahkan tombol hapus per item dengan konfirmasi
    const deleteButtons = view.querySelectorAll('.delete-btn');
    deleteButtons.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            if (confirm('Apakah Anda yakin ingin menghapus cerita ini?')) {
                const id = e.target.dataset.id;
                await db.deleteStory(id);
                showToast('Cerita dihapus', 'success');
                e.target.closest('.story-card').remove();

                // Update empty message if no stories left
                if (view.querySelectorAll('.story-card').length === 0) {
                    storiesList.innerHTML = '<p class="empty-message">Tidak ada cerita offline</p>';
                }
            }
        });
    });

    // Tambahkan tombol hapus semua dengan konfirmasi
    view.querySelector('#clearStoriesBtn').addEventListener('click', async () => {
        if (confirm('Apakah Anda yakin ingin menghapus semua cerita offline?')) {
            await db.clearStories();
            showToast('Semua cerita offline dihapus', 'success');
            storiesList.innerHTML = '<p class="empty-message">Tidak ada cerita offline</p>';
        }
    });

    return view;
}