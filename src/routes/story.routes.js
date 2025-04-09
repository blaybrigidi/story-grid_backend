const express = require('express');
const router = express.Router();
const storyController = require('../controllers/story.controller');

// GET all stories
router.get('/', storyController.getAllStories);

// GET a single story by ID
router.get('/:id', storyController.getStoryById);

// POST create a new story
router.post('/', storyController.createStory);

// PUT update a story
router.put('/:id', storyController.updateStory);

// DELETE a story
router.delete('/:id', storyController.deleteStory);

module.exports = router; 