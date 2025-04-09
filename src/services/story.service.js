class StoryService {
    // This is a mock implementation. In a real application, 
    // you would interact with a database here
    constructor() {
        this.stories = [];
    }

    async getAllStories() {
        // In a real application, this would fetch from a database
        return this.stories;
    }

    async getStoryById(id) {
        // In a real application, this would fetch from a database
        return this.stories.find(story => story.id === id);
    }

    async createStory(storyData) {
        // In a real application, this would save to a database
        const newStory = {
            id: Date.now().toString(),
            ...storyData,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        this.stories.push(newStory);
        return newStory;
    }

    async updateStory(id, storyData) {
        // In a real application, this would update in a database
        const index = this.stories.findIndex(story => story.id === id);
        if (index === -1) return null;

        const updatedStory = {
            ...this.stories[index],
            ...storyData,
            updatedAt: new Date()
        };
        this.stories[index] = updatedStory;
        return updatedStory;
    }

    async deleteStory(id) {
        // In a real application, this would delete from a database
        const index = this.stories.findIndex(story => story.id === id);
        if (index === -1) return false;

        this.stories.splice(index, 1);
        return true;
    }
}

module.exports = new StoryService(); 