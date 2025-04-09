const storyService = require('../services/story.service');

class StoryController {
    async getAllStories(req, res, next) {
        try {
            const stories = await storyService.getAllStories();
            res.json(stories);
        } catch (error) {
            next(error);
        }
    }

    async getStoryById(req, res, next) {
        try {
            const story = await storyService.getStoryById(req.params.id);
            if (!story) {
                return res.status(404).json({ message: 'Story not found' });
            }
            res.json(story);
        } catch (error) {
            next(error);
        }
    }

    async createStory(req, res, next) {
        try {
            const newStory = await storyService.createStory(req.body);
            res.status(201).json(newStory);
        } catch (error) {
            next(error);
        }
    }

    async updateStory(req, res, next) {
        try {
            const updatedStory = await storyService.updateStory(req.params.id, req.body);
            if (!updatedStory) {
                return res.status(404).json({ message: 'Story not found' });
            }
            res.json(updatedStory);
        } catch (error) {
            next(error);
        }
    }

    async deleteStory(req, res, next) {
        try {
            const result = await storyService.deleteStory(req.params.id);
            if (!result) {
                return res.status(404).json({ message: 'Story not found' });
            }
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new StoryController(); 