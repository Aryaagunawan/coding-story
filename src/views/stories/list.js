import { showToast } from '../../utils/api.js';
import { StoryPresenter } from '../../presenters/StoryPresenter.js';
import L from 'leaflet';
import { StoryDatabase } from '../../utils/database.js';

export default async function StoryListView() {
  const storyListView = document.createElement('main');
  storyListView.className = 'story-list-view';
  storyListView.id = 'main-content';
  storyListView.tabIndex = "-1";

  storyListView.innerHTML = `
    <section class="hero-section">
      <div class="hero-content">
        <h1>Dicoding Stories</h1>
        <p>Discover and share experiences from the Dicoding community</p>
        <a href="#/add-story" class="btn-primary">
          <i class="fas fa-plus"></i> Add Story
        </a>
      </div>
    </section>
    
    <section class="stories-container">
      <div class="stories-header">
        <h2>Recent Stories</h2>
        <div class="view-options">
          <button id="mapViewBtn" class="btn-icon" aria-label="View as map">
            <i class="fas fa-map"></i>
          </button>
          <button id="listViewBtn" class="btn-icon active" aria-label="View as list">
            <i class="fas fa-list"></i>
          </button>
        </div>
      </div>
      
      <div id="storiesList" class="stories-grid"></div>
      <div id="storiesMap" class="stories-map" style="display: none;"></div>
      
      <div class="pagination">
        <button id="prevPage" class="btn-outline" disabled>Previous</button>
        <span id="pageInfo">Page 1</span>
        <button id="nextPage" class="btn-outline">Next</button>
      </div>
    </section>
  `;

  // Initialize variables
  let currentPage = 1;
  const pageSize = 6;
  let isMapView = false;
  let stories = [];
  let map = null;
  let markers = [];

  // Initialize StoryPresenter
  const storyPresenter = new StoryPresenter({
    showStories: (storiesData) => {
      stories = storiesData.listStory;
      renderStories();
      renderPagination(currentPage, storiesData.totalItems);

      if (isMapView) {
        renderMap();
      }
    },
    showStoryDetail: () => { },
    showError: (message) => {
      showToast(message, 'error');
    },
    onAddStorySuccess: () => { },
    onAddStoryError: () => { }
  });

  // Load stories from IndexedDB when offline
  async function loadStoriesFromDB() {
    try {
      const db = new StoryDatabase();
      const stories = await db.getAllStories();
      if (stories.length > 0) {
        return {
          listStory: stories,
          totalItems: stories.length
        };
      }
      return null;
    } catch (error) {
      console.error('Error loading stories from DB:', error);
      return null;
    }
  }

  // Modified loadStories with offline support
  const loadStories = async (page = 1, withLocation = false) => {
    try {
      if (navigator.onLine) {
        const stories = await storyPresenter.getAllStories(page, pageSize, withLocation);
        // Save to IndexedDB when online
        try {
          const db = new StoryDatabase();
          for (const story of stories.listStory) {
            await db.saveStory(story);
          }
        } catch (dbError) {
          console.error('Error saving stories to DB:', dbError);
        }
        return stories;
      } else {
        const offlineStories = await loadStoriesFromDB();
        if (offlineStories) {
          storyPresenter.showStories(offlineStories);
          showToast('Anda sedang offline. Menampilkan cerita yang disimpan', 'info');
          return offlineStories;
        } else {
          throw new Error('Tidak ada koneksi internet dan tidak ada data offline');
        }
      }
    } catch (error) {
      storyPresenter.showError(error.message);
      return { listStory: [], totalItems: 0 };
    }
  };

  // Render stories list with animations
  const renderStories = () => {
    const storiesList = storyListView.querySelector('#storiesList');
    storiesList.innerHTML = '';

    if (stories.length === 0) {
      storiesList.innerHTML = '<p class="empty-message">No stories found. Be the first to share!</p>';
      return;
    }

    stories.forEach((story, index) => {
      const storyCard = document.createElement('article');
      storyCard.className = 'story-card';
      storyCard.innerHTML = `
        <img src="${story.photoUrl}" alt="${story.description}" class="story-image">
        <div class="story-content">
          <h3>${story.name}</h3>
          <p class="story-description">${story.description}</p>
          <div class="story-meta">
            <span><i class="fas fa-calendar-alt"></i> ${new Date(story.createdAt).toLocaleDateString()}</span>
            ${story.lat ? `<span><i class="fas fa-map-marker-alt"></i> Location</span>` : ''}
          </div>
          <a href="#/stories/${story.id}" class="btn-outline">Read More</a>
        </div>
      `;

      // Set view transition name for each card
      storyCard.style.viewTransitionName = `story-card-${index}`;
      storiesList.appendChild(storyCard);

      // Animate card entrance
      storyCard.animate([
        { opacity: 0, transform: 'scale(0.9)' },
        { opacity: 1, transform: 'scale(1)' }
      ], {
        duration: 300,
        delay: index * 50,
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)'
      });
    });
  };

  // Render map with multiple layers
  const renderMap = () => {
    const storiesMap = storyListView.querySelector('#storiesMap');
    storiesMap.innerHTML = '';

    const baseLayers = {
      "Street View": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }),
      "Satellite": L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
      }),
      "Topography": L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> contributors'
      })
    };

    if (!map) {
      map = L.map('storiesMap', {
        layers: [baseLayers["Street View"]]
      }).setView([-2.5489, 118.0149], 4);

      // Add layer control
      L.control.layers(baseLayers, null, {
        position: 'topright'
      }).addTo(map);
    }

    // Clear existing markers
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];

    // Add new markers
    stories.filter(story => story.lat && story.lon).forEach(story => {
      const marker = L.marker([story.lat, story.lon]).addTo(map)
        .bindPopup(`
          <h3>${story.name}</h3>
          <img src="${story.photoUrl}" alt="${story.description}" style="width:100%;max-height:150px;object-fit:cover;">
          <p>${story.description}</p>
          <a href="#/stories/${story.id}" class="btn-outline">View Details</a>
        `, {
          maxWidth: 300,
          className: 'custom-popup'
        });
      markers.push(marker);
    });

    if (markers.length > 0) {
      const group = new L.featureGroup(markers);
      map.fitBounds(group.getBounds().pad(0.1));
    }
  };

  const renderPagination = (page, totalItems) => {
    const totalPages = Math.ceil(totalItems / pageSize);
    const prevBtn = storyListView.querySelector('#prevPage');
    const nextBtn = storyListView.querySelector('#nextPage');
    const pageInfo = storyListView.querySelector('#pageInfo');

    pageInfo.textContent = `Page ${page} of ${totalPages}`;
    prevBtn.disabled = page <= 1;
    nextBtn.disabled = page >= totalPages;
  };

  const toggleView = () => {
    isMapView = !isMapView;
    const listViewBtn = storyListView.querySelector('#listViewBtn');
    const mapViewBtn = storyListView.querySelector('#mapViewBtn');
    const storiesList = storyListView.querySelector('#storiesList');
    const storiesMap = storyListView.querySelector('#storiesMap');

    if (isMapView) {
      listViewBtn.classList.remove('active');
      mapViewBtn.classList.add('active');
      storiesList.style.display = 'none';
      storiesMap.style.display = 'block';
      renderMap();
    } else {
      listViewBtn.classList.add('active');
      mapViewBtn.classList.remove('active');
      storiesList.style.display = 'grid';
      storiesMap.style.display = 'none';
    }
  };

  // Event listeners
  storyListView.querySelector('#mapViewBtn').addEventListener('click', toggleView);
  storyListView.querySelector('#listViewBtn').addEventListener('click', toggleView);
  storyListView.querySelector('#prevPage').addEventListener('click', async () => {
    currentPage--;
    await loadStories(currentPage, isMapView);
  });
  storyListView.querySelector('#nextPage').addEventListener('click', async () => {
    currentPage++;
    await loadStories(currentPage, isMapView);
  });

  // Initial load
  await loadStories(currentPage);

  return storyListView;
}