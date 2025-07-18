// src/models/StoryModel.js
import { StoryService } from '../utils/api.js';

export class StoryModel {
    static async getAllStories(page, size, withLocation) {
        return StoryService.getAllStories(page, size, withLocation);
    }

    static async getStoryById(id) {
        return StoryService.getStoryById(id);
    }

    static async addStory(description, photoFile, lat, lon) {
        return StoryService.addStory(description, photoFile, lat, lon);
    }
}