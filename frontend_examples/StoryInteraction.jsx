import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

// API client setup
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Set auth token for all requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle decryption of response data
const decryptData = async (encryptedData) => {
  try {
    const response = await api.post('/util/decrypt', {
      data: { encryptedData }
    });
    return response.data.data;
  } catch (error) {
    console.error('Decryption error:', error);
    throw error;
  }
};

const StoryInteraction = () => {
  const { storyId } = useParams();
  const [story, setStory] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [likeCount, setLikeCount] = useState(0);
  const [userLiked, setUserLiked] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch story data
  const fetchStory = async () => {
    try {
      setLoading(true);
      const response = await api.post('/story/getStory', {
        data: { storyId }
      });

      // Decrypt the data
      const decryptedData = await decryptData(response.data.data);
      setStory(decryptedData);
      setUserLiked(decryptedData.userLiked || false);
      setLikeCount(decryptedData.likes?.length || 0);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching story:', error);
      setError('Failed to load story. Please try again.');
      setLoading(false);
    }
  };

  // Fetch comments
  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await api.post('/story/getComments', {
        data: { 
          storyId,
          page,
          limit: 10
        }
      });

      // Decrypt the data
      const decryptedData = await decryptData(response.data.data);
      setComments(decryptedData.comments);
      setTotalPages(decryptedData.pagination.pages);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching comments:', error);
      setError('Failed to load comments. Please try again.');
      setLoading(false);
    }
  };

  // Handle like/unlike
  const toggleLike = async () => {
    try {
      const endpoint = userLiked ? '/story/unlikeStory' : '/story/likeStory';
      const response = await api.post(endpoint, {
        data: { storyId }
      });

      // Update state
      const decryptedData = await decryptData(response.data.data);
      setLikeCount(decryptedData.likeCount);
      setUserLiked(!userLiked);
    } catch (error) {
      console.error('Error toggling like:', error);
      setError(userLiked ? 'Failed to unlike story' : 'Failed to like story');
    }
  };

  // Handle comment submission
  const submitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const commentData = {
        storyId,
        content: newComment,
      };

      // Add parentId if replying to a comment
      if (replyTo) {
        commentData.parentId = replyTo.id;
      }

      const response = await api.post('/story/commentStory', {
        data: commentData
      });

      // Reset form
      setNewComment('');
      setReplyTo(null);

      // Refresh comments
      fetchComments();
    } catch (error) {
      console.error('Error posting comment:', error);
      setError('Failed to post comment. Please try again.');
    }
  };

  // Handle deleting a comment
  const deleteComment = async (commentId) => {
    try {
      await api.post('/story/deleteComment', {
        data: { commentId }
      });

      // Refresh comments after deletion
      fetchComments();
    } catch (error) {
      console.error('Error deleting comment:', error);
      setError('Failed to delete comment. Please try again.');
    }
  };

  // Initialize
  useEffect(() => {
    if (storyId) {
      fetchStory();
      fetchComments();
    }
  }, [storyId]);

  // Refresh comments when page changes
  useEffect(() => {
    if (storyId) {
      fetchComments();
    }
  }, [page]);

  // Loading state
  if (loading && !story) {
    return <div className="loading">Loading story...</div>;
  }

  // Error state
  if (error && !story) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="story-interaction">
      {story && (
        <div className="story-container">
          <h1>{story.title}</h1>
          <div className="story-meta">
            <span>By: {story.author?.username}</span>
            <span>Posted: {new Date(story.createdAt).toLocaleDateString()}</span>
          </div>
          
          <div className="story-content">
            {story.content}
          </div>
          
          <div className="story-actions">
            <button 
              className={`like-button ${userLiked ? 'liked' : ''}`}
              onClick={toggleLike}
            >
              {userLiked ? 'Unlike' : 'Like'} ({likeCount})
            </button>
          </div>
          
          <div className="comment-section">
            <h3>Comments ({comments.length})</h3>
            
            {/* Comment form */}
            <form onSubmit={submitComment} className="comment-form">
              {replyTo && (
                <div className="reply-indicator">
                  Replying to {replyTo.User.username}'s comment
                  <button 
                    type="button" 
                    onClick={() => setReplyTo(null)}
                    className="cancel-reply"
                  >
                    Cancel
                  </button>
                </div>
              )}
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={replyTo ? 'Write a reply...' : 'Write a comment...'}
                required
              />
              <button type="submit">
                {replyTo ? 'Post Reply' : 'Post Comment'}
              </button>
            </form>
            
            {/* Comments list */}
            <div className="comments-list">
              {comments.length === 0 ? (
                <p>No comments yet. Be the first to comment!</p>
              ) : (
                comments.map(comment => (
                  <div key={comment.id} className="comment">
                    <div className="comment-header">
                      <span className="comment-author">{comment.User.username}</span>
                      <span className="comment-date">
                        {new Date(comment.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="comment-content">{comment.content}</div>
                    <div className="comment-actions">
                      <button 
                        onClick={() => setReplyTo(comment)}
                        className="reply-button"
                      >
                        Reply
                      </button>
                      {/* Only show delete button for user's own comments */}
                      {comment.userId === localStorage.getItem('userId') && (
                        <button 
                          onClick={() => deleteComment(comment.id)}
                          className="delete-button"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                    
                    {/* Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="comment-replies">
                        {comment.replies.map(reply => (
                          <div key={reply.id} className="reply">
                            <div className="comment-header">
                              <span className="comment-author">{reply.User.username}</span>
                              <span className="comment-date">
                                {new Date(reply.createdAt).toLocaleString()}
                              </span>
                            </div>
                            <div className="comment-content">{reply.content}</div>
                            <div className="comment-actions">
                              {/* Only show delete button for user's own replies */}
                              {reply.userId === localStorage.getItem('userId') && (
                                <button 
                                  onClick={() => deleteComment(reply.id)}
                                  className="delete-button"
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                        
                        {/* Show "View more replies" if there are more replies than shown */}
                        {comment.replyCount > comment.replies.length && (
                          <button className="view-more-replies">
                            View {comment.replyCount - comment.replies.length} more replies
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button 
                  onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                >
                  Previous
                </button>
                <span>Page {page} of {totalPages}</span>
                <button 
                  onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={page === totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StoryInteraction; 