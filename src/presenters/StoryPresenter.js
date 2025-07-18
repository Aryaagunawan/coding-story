// src/presenters/StoryPresenter.js
import { StoryModel } from '../models/StoryModel.js';
import { NotificationService, showToast } from '../utils/api.js';

export class StoryPresenter {
    constructor(view) {
        this.view = view;
    }

    async getAllStories(page = 1, size = 10, withLocation = false) {
        try {
            const stories = await StoryModel.getAllStories(page, size, withLocation);
            this.view.showStories(stories);
        } catch (error) {
            this.view.showError(error.message);
        }
    }

    async getStoryById(id) {
        try {
            const story = await StoryModel.getStoryById(id);
            this.view.showStoryDetail(story);
        } catch (error) {
            this.view.showError(error.message);
        }
    }

    async addStory(description, photoFile, lat = null, lon = null) {
        try {
            const result = await StoryModel.addStory(description, photoFile, lat, lon);
            this.view.onAddStorySuccess(result);

            NotificationService.sendNotification({
                title: 'Story published!',
                options: {
                    body: `You shared: "${description.substring(0, 50)}${description.length > 50 ? '...' : ''}"`
                }
            });
        } catch (error) {
            this.view.onAddStoryError(error.message);
        }
    }
}