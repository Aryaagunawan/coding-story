import { StoryDatabase } from '../../utils/database.js';
import { showToast } from '../../utils/api.js';

export default async function OfflineStoriesView() {
    const view = document.createElement('main');
    view.className = 'offline-stories-view';
    view.id = 'main-content';

    view.innerHTML = `
        <section class="offline-stories-container">
            <h1>Offline Stories</h1>
            <div id="offlineStoriesList" class="stories-grid"></div>
            <button id="clearStoriesBtn" class="btn-danger">Clear All Offline Stories</button>
        </section>
    `;

    const db = new StoryDatabase();
    const stories = await db.getAllStories();

    const storiesList = view.querySelector('#offlineStoriesList');

    if (stories.length === 0) {
        storiesList.innerHTML = '<p class="empty-message">No offline stories found</p>';
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
                    <button class="btn-danger delete-btn" data-id="${story.id}">Delete</button>
                </div>
            `;
            storiesList.appendChild(storyCard);
        });
    }

    view.querySelector('#clearStoriesBtn').addEventListener('click', async () => {
        await db.clearStories();
        showToast('All offline stories cleared', 'success');
        window.location.reload();
    });

    view.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = e.target.dataset.id;
            await db.deleteStory(id);
            showToast('Story deleted', 'success');
            window.location.reload();
        });
    });

    return view;
}