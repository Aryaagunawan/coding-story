// src/models/StoryModel.js
import { StoryService } from '../utils/api.js';
import { StoryDatabase } from '../utils/database.js'; // Pastikan ini diimpor

export class StoryModel {
    static async getAllStories(page = 1, size = 10, withLocation = false) {
        try {
            // Coba ambil dari network dulu
            const response = await StoryService.getAllStories(page, size, withLocation);

            // Validasi response
            if (!response || typeof response !== 'object') {
                throw new Error('Response tidak valid dari server');
            }

            // Berikan nilai default jika listStory tidak ada atau bukan array
            if (!Array.isArray(response.listStory)) {
                response.listStory = [];
            }

            // Simpan ke IndexedDB jika dapat response valid
            const db = new StoryDatabase();
            for (const story of response.listStory) {
                await db.saveStory(this._normalizeStory(story));
            }

            // Normalisasi data
            return {
                listStory: response.listStory.map(story => this._normalizeStory(story)),
                totalItems: parseInt(response.totalItems) || 0,
                page: parseInt(response.page) || page,
                size: parseInt(response.size) || size,
                withLocation: Boolean(response.withLocation)
            };

        } catch (error) {
            console.error('[StoryModel] Network error, trying cache:', error);

            // Jika offline, ambil dari IndexedDB
            const db = new StoryDatabase();
            const stories = await db.getAllStories({
                limit: size,
                sortBy: 'createdAt',
                withLocation: withLocation
            });

            return {
                listStory: stories,
                totalItems: stories.length,
                page: page,
                size: size,
                withLocation: withLocation
            };
        }
    }

    static async getStoryById(id) {
        try {
            if (!id) {
                throw new Error('ID story tidak valid');
            }

            // Coba ambil dari network dulu
            const story = await StoryService.getStoryById(id);

            // Validasi response
            if (!story) {
                throw new Error('Story tidak ditemukan');
            }

            // Simpan ke IndexedDB
            const db = new StoryDatabase();
            await db.saveStory(this._normalizeStory(story));

            return this._normalizeStory(story);

        } catch (error) {
            console.error(`[StoryModel] Network error, trying cache for story ${id}:`, error);

            // Jika offline, ambil dari IndexedDB
            const db = new StoryDatabase();
            const story = await db.getStoryById(id);

            if (!story) {
                const enhancedError = new Error(`Story tidak ditemukan (offline mode)`);
                enhancedError.isOffline = true;
                throw enhancedError;
            }

            return story;
        }
    }

    static async addStory(description, photoFile, lat = null, lon = null) {
        try {
            if (!description || !photoFile) {
                throw new Error('Deskripsi dan foto harus diisi');
            }

            const response = await StoryService.addStory(description, photoFile, lat, lon);

            // Validasi response
            if (!response || !response.message) {
                throw new Error('Gagal menambahkan story');
            }

            // Jika berhasil di server, simpan ke IndexedDB juga
            if (response.story) {
                const db = new StoryDatabase();
                await db.saveStory(this._normalizeStory(response.story));
            }

            return {
                ...response,
                success: true,
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            console.error('[StoryModel] Error adding story:', error);

            // Jika offline, simpan ke IndexedDB sebagai draft
            if (error.message.includes('Failed to fetch') || error.message.includes('Network request failed')) {
                const db = new StoryDatabase();
                const offlineStory = {
                    id: `offline-${Date.now()}`,
                    name: 'User', // Default name
                    description,
                    photoUrl: URL.createObjectURL(photoFile),
                    createdAt: new Date().toISOString(),
                    lat,
                    lon,
                    isOffline: true
                };

                await db.saveStory(offlineStory);

                return {
                    message: 'Story disimpan secara offline dan akan diupload ketika koneksi tersedia',
                    story: offlineStory,
                    isOffline: true,
                    success: true
                };
            }

            const enhancedError = new Error(`Gagal menambahkan story: ${error.message}`);
            enhancedError.originalError = error;
            throw enhancedError;
        }
    }

    // Helper method untuk normalisasi data story
    static _normalizeStory(story) {
        if (!story) return null;

        return {
            id: story.id || '',
            name: story.name || 'Anonymous',
            description: story.description || '',
            photoUrl: story.photoUrl || '',
            createdAt: story.createdAt || new Date().toISOString(),
            lat: story.lat ? parseFloat(story.lat) : null,
            lon: story.lon ? parseFloat(story.lon) : null,
            isOffline: Boolean(story.isOffline)
        };
    }
}