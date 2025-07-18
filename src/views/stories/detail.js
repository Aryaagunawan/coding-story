import { StoryPresenter } from '../../presenters/StoryPresenter.js';
import { showToast } from '../../utils/api.js';
import L from 'leaflet';

export default async function StoryDetailView(params) {
  const storyDetailView = document.createElement('main');
  storyDetailView.className = 'story-detail-view';
  storyDetailView.id = 'main-content';

  const id = params.id;
  if (!id) {
    showToast('Invalid story ID', 'error');
    window.location.hash = '#/stories';
    return document.createElement('div');
  }

  storyDetailView.innerHTML = `
    <article class="story-detail-container" aria-labelledby="story-title">
      <header class="story-detail-header">
        <a href="#/stories" class="btn-back">
          <i class="fas fa-arrow-left"></i> Back to Stories
        </a>
      </header>
      
      <section class="story-detail">
        <img id="storyImage" src="" alt="" class="story-detail-image">
        <div class="story-detail-content">
          <h1 id="storyTitle">Loading story...</h1>
          <div class="story-meta">
            <span id="storyAuthor"></span>
            <span id="storyDate"></span>
          </div>
          <p id="storyDescription" class="story-description"></p>
          
          <section id="storyLocation" class="story-location" style="display: none;" aria-labelledby="location-heading">
            <h2 id="location-heading"><i class="fas fa-map-marker-alt"></i> Location</h2>
            <div id="detailMap" class="detail-map" role="region" aria-label="Story location on map"></div>
          </section>
        </div>
      </section>
    </article>
  `;

  let mapInstance = null;

  // Initialize StoryPresenter
  const storyPresenter = new StoryPresenter({
    showStories: () => { },
    showStoryDetail: (story) => {
      if (!story) throw new Error('Story not found');

      // Update DOM
      storyDetailView.querySelector('#storyImage').src = story.photoUrl;
      storyDetailView.querySelector('#storyImage').alt = story.description;
      storyDetailView.querySelector('#storyTitle').textContent = story.name;
      storyDetailView.querySelector('#storyAuthor').textContent = `By ${story.name}`;
      storyDetailView.querySelector('#storyDate').textContent = new Date(story.createdAt).toLocaleString();
      storyDetailView.querySelector('#storyDescription').textContent = story.description;

      // Show location if available
      if (story.lat && story.lon) {
        const locationSection = storyDetailView.querySelector('#storyLocation');
        locationSection.style.display = 'block';

        // Initialize map with multiple layers
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

        // Clean up previous map instance if exists
        if (mapInstance) {
          mapInstance.remove();
        }

        mapInstance = L.map('detailMap', {
          layers: [baseLayers["Street View"]]
        }).setView([story.lat, story.lon], 13);

        // Add layer control
        L.control.layers(baseLayers, null, {
          position: 'topright'
        }).addTo(mapInstance);

        // Add marker with custom popup
        L.marker([story.lat, story.lon]).addTo(mapInstance)
          .bindPopup(`
            <div class="map-popup">
              <h3>${story.name}</h3>
              <img src="${story.photoUrl}" alt="${story.description}" style="max-width:200px;max-height:150px;object-fit:cover;">
              <p>${story.description}</p>
            </div>
          `, {
            maxWidth: 300,
            className: 'custom-popup'
          })
          .openPopup();
      }
    },
    showError: (message) => {
      console.error('Error loading story:', message);
      showToast(message || 'Failed to load story', 'error');
      window.location.hash = '#/stories';
    },
    onAddStorySuccess: () => { },
    onAddStoryError: () => { }
  });

  // Load the story through presenter
  const loadStory = async () => {
    try {
      await storyPresenter.getStoryById(id);
    } catch (error) {
      console.error('Error in loadStory:', error);
    }
  };

  // Add loading state
  storyDetailView.querySelector('#storyTitle').textContent = 'Loading story...';

  // Load the story after DOM is ready
  setTimeout(loadStory, 50);

  // Clean up map when view is removed
  storyDetailView.cleanup = () => {
    if (mapInstance) {
      mapInstance.remove();
      mapInstance = null;
    }
  };

  return storyDetailView;
}