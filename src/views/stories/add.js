import L from 'leaflet';
import { showToast } from '../../utils/api.js';
import { StoryPresenter } from '../../presenters/StoryPresenter.js';
import { NotificationService } from '../../utils/api.js';

export default async function AddStoryView() {
  const addStoryView = document.createElement('main');
  addStoryView.className = 'add-story-view';
  addStoryView.id = 'main-content';

  // Request push notification permission
  try {
    await NotificationService.requestPermission();
    await NotificationService.registerPushNotifications();
  } catch (error) {
    console.error('Push notification error:', error);
  }

  addStoryView.innerHTML = `
    <section class="add-story-container">
      <div class="add-story-header">
        <h1>Share Your Story</h1>
        <p>Tell us about your Dicoding experience</p>
      </div>
      
      <form id="addStoryForm" class="add-story-form">
        <div class="form-group">
          <label for="description">Story Description</label>
          <textarea id="description" name="description" rows="5" required aria-required="true"></textarea>
        </div>
        
        <div class="form-group">
          <label for="photo">Upload Photo (max 1MB)</label>
          <div class="photo-upload">
            <label for="photo" class="btn-outline">
              <i class="fas fa-upload"></i> Choose Photo
            </label>
            <button type="button" id="cameraBtn" class="btn-outline">
              <i class="fas fa-camera"></i> Take Photo
            </button>
            <input type="file" id="photo" name="photo" accept="image/*" capture="environment" hidden>
            <div id="photoPreview" class="photo-preview"></div>
          </div>
        </div>
        
        <div class="form-group">
          <label>Add Location (optional)</label>
          <div class="location-options">
            <button type="button" id="getLocationBtn" class="btn-outline">
              <i class="fas fa-location-arrow"></i> Use Current Location
            </button>
            <span>or</span>
            <button type="button" id="pickLocationBtn" class="btn-outline">
              <i class="fas fa-map-marker-alt"></i> Pick on Map
            </button>
          </div>
          <small class="hint">If location access is denied, you can pick manually on map.</small>
          
          <div id="locationMap" class="location-map" style="display: none;"></div>
          <div id="locationInfo" class="location-info" style="display: none;">
            <p>Selected Location: <span id="coordinates"></span></p>
          </div>
          
          <input type="hidden" id="lat" name="lat">
          <input type="hidden" id="lon" name="lon">
        </div>
        
        <div class="form-actions">
          <a href="#/stories" class="btn-outline">Cancel</a>
          <button type="submit" class="btn-primary">Publish Story</button>
        </div>
      </form>
    </section>
  `;

  let map = null;
  let marker = null;
  let selectedLocation = null;
  let photoFile = null;

  // Initialize StoryPresenter with view methods
  const storyPresenter = new StoryPresenter({
    showStories: () => { },
    showStoryDetail: () => { },
    showError: (message) => {
      showToast(message, 'error');
    },
    onAddStorySuccess: () => {
      showToast('Story published successfully!', 'success');
      window.location.hash = '#/stories';
    },
    onAddStoryError: (message) => {
      showToast(message, 'error');
    }
  });

  const updatePhotoPreview = (src) => {
    const preview = addStoryView.querySelector('#photoPreview');
    preview.innerHTML = '';
    if (src) {
      const img = document.createElement('img');
      img.src = src;
      img.alt = 'Preview of uploaded photo';
      preview.appendChild(img);
    }
  };

  addStoryView.querySelector('#photo').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      showToast('Image size must be less than 1MB', 'error');
      e.target.value = '';
      return;
    }

    photoFile = file;
    updatePhotoPreview(URL.createObjectURL(file));
  });

  addStoryView.querySelector('#cameraBtn').addEventListener('click', async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      });

      const cameraModal = document.createElement('div');
      cameraModal.className = 'camera-modal';
      cameraModal.innerHTML = `
        <div class="camera-container">
          <video id="cameraView" autoplay playsinline></video>
          <div class="camera-controls">
            <button id="captureBtn" class="btn-primary">
              <i class="fas fa-camera"></i> Capture
            </button>
            <button id="cancelBtn" class="btn-outline">
              <i class="fas fa-times"></i> Cancel
            </button>
          </div>
        </div>
      `;

      document.body.appendChild(cameraModal);
      const cameraView = cameraModal.querySelector('#cameraView');
      cameraView.srcObject = stream;

      cameraModal.querySelector('#captureBtn').addEventListener('click', () => {
        const canvas = document.createElement('canvas');
        canvas.width = cameraView.videoWidth;
        canvas.height = cameraView.videoHeight;
        canvas.getContext('2d').drawImage(cameraView, 0, 0);

        canvas.toBlob(blob => {
          photoFile = new File([blob], 'photo.jpg', { type: 'image/jpeg' });
          updatePhotoPreview(URL.createObjectURL(blob));
          stream.getTracks().forEach(track => track.stop());
          document.body.removeChild(cameraModal);
        }, 'image/jpeg', 0.9);
      });

      cameraModal.querySelector('#cancelBtn').addEventListener('click', () => {
        stream.getTracks().forEach(track => track.stop());
        document.body.removeChild(cameraModal);
      });
    } catch (error) {
      showToast('Camera access denied or not available', 'error');
      console.error('Camera error:', error);
    }
  });

  addStoryView.querySelector('#getLocationBtn').addEventListener('click', () => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser', 'error');
      return;
    }

    showToast('Getting your location...', 'info');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        selectedLocation = {
          lat: position.coords.latitude,
          lon: position.coords.longitude
        };
        updateLocationUI();
        showToast('Location obtained successfully', 'success');
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          showToast('Please allow location access from your browser settings.', 'error');
        } else {
          showToast(`Error getting location: ${error.message}`, 'error');
        }
      }
    );
  });

  addStoryView.querySelector('#pickLocationBtn').addEventListener('click', () => {
    const mapContainer = addStoryView.querySelector('#locationMap');
    mapContainer.style.display = 'block';

    if (!map) {
      map = L.map('locationMap').setView([-2.5489, 118.0149], 4);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      map.on('click', (e) => {
        selectedLocation = {
          lat: e.latlng.lat,
          lon: e.latlng.lng
        };
        if (marker) map.removeLayer(marker);
        marker = L.marker([selectedLocation.lat, selectedLocation.lon]).addTo(map);
        updateLocationUI();
      });
    }
  });

  const updateLocationUI = () => {
    if (!selectedLocation) return;
    addStoryView.querySelector('#lat').value = selectedLocation.lat;
    addStoryView.querySelector('#lon').value = selectedLocation.lon;
    const locationInfo = addStoryView.querySelector('#locationInfo');
    locationInfo.style.display = 'block';
    locationInfo.querySelector('#coordinates').textContent =
      `${selectedLocation.lat.toFixed(4)}, ${selectedLocation.lon.toFixed(4)}`;
  };

  addStoryView.querySelector('#addStoryForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const description = addStoryView.querySelector('#description').value;
    const lat = addStoryView.querySelector('#lat').value;
    const lon = addStoryView.querySelector('#lon').value;

    if (!photoFile) {
      showToast('Please select a photo', 'error');
      return;
    }

    // Call the presenter instance method instead of static method
    storyPresenter.addStory(description, photoFile, lat || null, lon || null);
  });

  return addStoryView;
}