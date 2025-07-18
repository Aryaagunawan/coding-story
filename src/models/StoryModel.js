// src/models/StoryModel.js
import { StoryService } from '../utils/api.js';

export class StoryModel {
    static async getAllStories(page = 1, size = 10, withLocation = false) {
        try {
            const response = await StoryService.getAllStories(page, size, withLocation);

            // Validasi response
            if (!response) {
                throw new Error('Tidak mendapat response dari server');
            }

            // Validasi struktur data
            if (!Array.isArray(response.listStory)) {
                throw new Error('Format data stories tidak valid');
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
            console.error('[StoryModel] Error fetching stories:', error);

            // Tambahkan konteks error
            const enhancedError = new Error(`Gagal mengambil stories: ${error.message}`);
            enhancedError.originalError = error;

            throw enhancedError;
        }
    }

    static async getStoryById(id) {
        try {
            if (!id) {
                throw new Error('ID story tidak valid');
            }

            const story = await StoryService.getStoryById(id);

            // Validasi response
            if (!story) {
                throw new Error('Story tidak ditemukan');
            }

            return this._normalizeStory(story);

        } catch (error) {
            console.error(`[StoryModel] Error fetching story ${id}:`, error);

            const enhancedError = new Error(`Gagal mengambil story: ${error.message}`);
            enhancedError.originalError = error;

            throw enhancedError;
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

            return {
                ...response,
                success: true,
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            console.error('[StoryModel] Error adding story:', error);

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
            lon: story.lon ? parseFloat(story.lon) : null
        };
    }
}