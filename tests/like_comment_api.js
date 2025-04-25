/** @format */
// Test file for like and comment API functionality
const axios = require('axios');

// Configuration
const API_URL = process.env.API_URL || 'http://localhost:3000/api';
let authToken = null;
let storyId = null;
let commentId = null;

// Helper function for API calls
const api = axios.create({
    baseURL: API_URL,
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Set auth token for subsequent requests
const setAuthToken = (token) => {
    authToken = token;
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

// Login function
const login = async (email, password) => {
    try {
        const response = await api.post('/user/login', {
            data: { email, password }
        });
        
        console.log('Login successful');
        setAuthToken(response.data.data.token);
        return response.data;
    } catch (error) {
        console.error('Login failed:', error.response?.data || error.message);
        throw error;
    }
};

// Create a test story
const createStory = async () => {
    try {
        const response = await api.post('/story/createStory', {
            data: {
                title: 'Test Story for Like/Comment API',
                content: 'This is a test story content for testing like and comment functionality',
                category: 'test',
                tags: ['test', 'api', 'likes', 'comments']
            }
        });
        
        console.log('Story created successfully');
        storyId = response.data.data.id;
        return response.data;
    } catch (error) {
        console.error('Story creation failed:', error.response?.data || error.message);
        throw error;
    }
};

// Test like story
const likeStory = async () => {
    try {
        const response = await api.post('/story/likeStory', {
            data: { storyId }
        });
        
        console.log('Story liked successfully');
        console.log('Like count:', response.data.data.likeCount);
        return response.data;
    } catch (error) {
        console.error('Like story failed:', error.response?.data || error.message);
        throw error;
    }
};

// Test unlike story
const unlikeStory = async () => {
    try {
        const response = await api.post('/story/unlikeStory', {
            data: { storyId }
        });
        
        console.log('Story unliked successfully');
        console.log('Like count:', response.data.data.likeCount);
        return response.data;
    } catch (error) {
        console.error('Unlike story failed:', error.response?.data || error.message);
        throw error;
    }
};

// Test add comment
const addComment = async () => {
    try {
        const response = await api.post('/story/commentStory', {
            data: {
                storyId,
                content: 'This is a test comment on the story'
            }
        });
        
        console.log('Comment added successfully');
        commentId = response.data.data.id;
        return response.data;
    } catch (error) {
        console.error('Add comment failed:', error.response?.data || error.message);
        throw error;
    }
};

// Test add reply to comment
const addReply = async () => {
    try {
        const response = await api.post('/story/commentStory', {
            data: {
                storyId,
                content: 'This is a reply to the test comment',
                parentId: commentId
            }
        });
        
        console.log('Reply added successfully');
        return response.data;
    } catch (error) {
        console.error('Add reply failed:', error.response?.data || error.message);
        throw error;
    }
};

// Test get comments
const getComments = async () => {
    try {
        const response = await api.post('/story/getComments', {
            data: {
                storyId,
                page: 1,
                limit: 10
            }
        });
        
        console.log('Comments retrieved successfully');
        console.log(`Retrieved ${response.data.data.comments.length} comments`);
        return response.data;
    } catch (error) {
        console.error('Get comments failed:', error.response?.data || error.message);
        throw error;
    }
};

// Test delete comment
const deleteComment = async () => {
    try {
        const response = await api.post('/story/deleteComment', {
            data: { commentId }
        });
        
        console.log('Comment deleted successfully');
        return response.data;
    } catch (error) {
        console.error('Delete comment failed:', error.response?.data || error.message);
        throw error;
    }
};

// Run all tests
const runTests = async () => {
    try {
        console.log('=== Starting Like/Comment API Tests ===');
        
        // Step 1: Login
        await login('testuser@example.com', 'password123');
        
        // Step 2: Create a test story
        await createStory();
        
        // Step 3: Like the story
        await likeStory();
        
        // Step 4: Unlike the story
        await unlikeStory();
        
        // Step 5: Like the story again (for later tests)
        await likeStory();
        
        // Step 6: Add a comment
        await addComment();
        
        // Step 7: Add a reply to the comment
        await addReply();
        
        // Step 8: Get all comments
        await getComments();
        
        // Step 9: Delete the comment
        await deleteComment();
        
        console.log('=== All tests completed successfully ===');
    } catch (error) {
        console.error('Test sequence failed:', error);
    }
};

// Run the tests
runTests(); 