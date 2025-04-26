# StoryGrid API Documentation

## Authentication

All endpoints except login and signup require authentication via JWT token.
Pass the token in the Authorization header as: `Bearer YOUR_TOKEN`

## Story Interaction Flow

The typical flow for story interaction is as follows:

1. **Create a Story**

   - User uploads media to `/api/media/upload`
   - User creates a story with `/api/story/createStory` and includes the media URLs

2. **View a Story**

   - Get story details with `/api/story/getStory`
   - Check if the user has liked the story (included in response)
   - Get comments with `/api/story/getComments`

3. **Interact with a Story**
   - Like/unlike a story with `/api/story/likeStory` or `/api/story/unlikeStory`
   - Add comments with `/api/story/commentStory`
   - Reply to comments by including a `parentId` in the commentStory request
   - Delete comments with `/api/story/deleteComment`

## Feed Endpoints

### Get Friends Feed

Retrieves stories from the user's friends and the user's own stories for the main feed.

```
POST /api/feed/getFeed
```

**Request Body:**

```json
{
  "data": {
    "page": 1,
    "limit": 10,
    "sortBy": "createdAt",
    "sortOrder": "DESC"
  }
}
```

**Response:**

```json
{
  "status": 200,
  "msg": "Feed retrieved successfully",
  "data": {
    "stories": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "title": "My Vacation Story",
        "content": "This is the content of my story",
        "userId": "user-id",
        "status": "published",
        "category": "travel",
        "tags": ["vacation", "summer"],
        "createdAt": "2023-06-15T14:30:00.000Z",
        "updatedAt": "2023-06-15T14:30:00.000Z",
        "author": {
          "id": "user-id",
          "username": "johndoe",
          "email": "john@example.com"
        },
        "media": [
          {
            "id": "media-id",
            "type": "image",
            "url": "https://cloudinary.url/image.jpg",
            "order": 0
          }
        ],
        "likes": [{ "userId": "liker-id-1" }, { "userId": "liker-id-2" }],
        "likeCount": 2,
        "commentCount": 5,
        "userLiked": true,
        "timeAgo": "2 days ago"
      }
    ],
    "pagination": {
      "total": 42,
      "page": 1,
      "pages": 5
    }
  }
}
```

### Get Discover Feed

Retrieves trending stories from all users for the discover feed.

```
POST /api/feed/getDiscover
```

**Request Body:**

```json
{
  "data": {
    "page": 1,
    "limit": 10
  }
}
```

**Response:**

```json
{
  "status": 200,
  "msg": "Discover feed retrieved successfully",
  "data": {
    "stories": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "title": "Trending Story Title",
        "content": "This is the content of the trending story",
        "userId": "user-id",
        "status": "published",
        "category": "technology",
        "tags": ["trending", "tech"],
        "createdAt": "2023-06-15T14:30:00.000Z",
        "updatedAt": "2023-06-15T14:30:00.000Z",
        "author": {
          "id": "user-id",
          "username": "techwriter",
          "email": "tech@example.com"
        },
        "media": [
          {
            "id": "media-id",
            "type": "image",
            "url": "https://cloudinary.url/image.jpg",
            "order": 0
          }
        ],
        "likeCount": 120,
        "commentCount": 45,
        "userLiked": false,
        "timeAgo": "1 day ago"
      }
    ],
    "pagination": {
      "total": 100,
      "page": 1,
      "pages": 10
    }
  }
}
```

## Media Endpoints

### Upload Media

```
POST /api/media/upload
```

**Request Body:**

```json
{
  "data": {
    "file": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEA...", // Base64 data or URL
    "fileName": "example.jpg",
    "storyId": "optional-story-id"
  }
}
```

**Response:**

```json
{
  "status": 201,
  "msg": "Media uploaded successfully",
  "data": "encrypted-data" // Contains URL, type, and metadata
}
```

To decrypt the data, use the utility endpoint.

### Get Direct Upload Parameters

```
POST /api/media/getUploadParams
```

This endpoint provides Cloudinary upload parameters for direct frontend uploads from local devices.

**Request Body:**

```json
{
  "data": {
    "fileName": "example.jpg", // Optional
    "fileType": "image/jpeg" // Optional
  }
}
```

**Response:**

```json
{
  "status": 200,
  "msg": "Upload parameters generated successfully",
  "data": {
    "cloudName": "your-cloud-name",
    "apiKey": "your-api-key",
    "uploadParams": {
      "timestamp": 1234567890,
      "folder": "storygrid/2023/7",
      "public_id": "storygrid/2023/7/1234567890_example",
      "api_key": "your-api-key",
      "signature": "calculated-signature-for-signed-uploads"
    },
    "uploadPreset": "my_unsigned_preset",
    "folder": "storygrid/2023/7",
    "uploadUrl": "https://api.cloudinary.com/v1_1/your-cloud-name/auto/upload"
  }
}
```

Use these parameters with the following frontend code to upload directly from the user's device:

```javascript
document.getElementById("upload-button").addEventListener("click", () => {
    const fileInput = document.getElementById("file-upload");
    const statusText = document.getElementById("upload-status");

    const file = fileInput.files[0];
    if (!file) {
        statusText.textContent = "Please select a file to upload.";
        return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "my_unsigned_preset"); // your preset name

    statusText.textContent = "Uploading...";

    fetch("https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/auto/upload", {
        method: "POST",
        body: formData
    })
    .then((res) => res.json())
    .then((data) => {
        statusText.innerHTML = `Upload successful! <br> <a href="${data.secure_url}" target="_blank">View file</a>`;
        console.log("Uploaded URL:", data.secure_url);

        // After uploading, save the media info to StoryGrid
        saveMediaToStoryGrid(data);
    })
    .catch((err) => {
        console.error("Upload failed:", err);
        statusText.textContent = "Upload failed. See console for details.";
    });
});

// Function to save the uploaded media to StoryGrid
function saveMediaToStoryGrid(cloudinaryData) {
    fetch('/api/media/saveUploadedMedia', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer YOUR_TOKEN'
        },
        body: JSON.stringify({
            data: {
                url: cloudinaryData.secure_url,
                type: cloudinaryData.resource_type === 'image' ? 'image' : 'video',
                metadata: {
                    publicId: cloudinaryData.public_id,
                    format: cloudinaryData.format,
                    size: cloudinaryData.bytes
                }
            }
        })
    })
    .then(res => res.json())
    .then(data => {
        console.log('Media saved to StoryGrid:', data);
    });
}

### Save Uploaded Media

```

POST /api/media/saveUploadedMedia

````

After a direct upload to Cloudinary, use this endpoint to save the media information in the StoryGrid database.

**Request Body:**

```json
{
  "data": {
    "url": "https://res.cloudinary.com/your-cloud-name/image/upload/v1234567890/example.jpg",
    "type": "image",
    "storyId": "optional-story-id",
    "metadata": {
      "publicId": "storygrid/2023/7/1234567890_example",
      "format": "jpg",
      "size": 123456
    }
  }
}
````

**Response:**

```json
{
  "status": 201,
  "msg": "Media record saved successfully",
  "data": {
    "mediaId": "123e4567-e89b-12d3-a456-426614174000",
    "url": "https://res.cloudinary.com/your-cloud-name/image/upload/v1234567890/example.jpg",
    "type": "image"
  }
}
```

### Delete Media

```
POST /api/media/delete
```

**Request Body:**

```json
{
  "data": {
    "mediaId": "123e4567-e89b-12d3-a456-426614174000"
  }
}
```

**Response:**

```json
{
  "status": 200,
  "msg": "Media deleted successfully",
  "data": null
}
```

## Story Endpoints

### Create Story

```
POST /api/story/createStory
```

**Request Body:**

```json
{
  "data": {
    "title": "My Story Title",
    "content": "This is the content of my story.",
    "category": "personal",
    "tags": ["tag1", "tag2"],
    "media": [
      {
        "url": "https://res.cloudinary.com/ddhomrzyn/image/upload/v1234567890/example.jpg",
        "type": "image"
      }
    ]
  }
}
```

**Response:**

```json
{
  "status": 201,
  "msg": "Story created successfully",
  "data": "encrypted-data" // Contains story details
}
```

### Get Story

```
POST /api/story/getStory
```

**Request Body:**

```json
{
  "data": {
    "storyId": "123e4567-e89b-12d3-a456-426614174000"
  }
}
```

**Response:**

```json
{
  "status": 200,
  "msg": "Story retrieved successfully",
  "data": "encrypted-data" // Contains story with author and media
}
```

### Delete Story

```
POST /api/story/deleteStory
```

**Request Body:**

```json
{
  "data": {
    "storyId": "123e4567-e89b-12d3-a456-426614174000"
  }
}
```

**Response:**

```json
{
  "status": 200,
  "msg": "Story deleted successfully",
  "data": null
}
```

### Like Story

```
POST /api/story/likeStory
```

**Request Body:**

```json
{
  "data": {
    "storyId": "123e4567-e89b-12d3-a456-426614174000"
  }
}
```

**Response:**

```json
{
  "status": 200,
  "msg": "Story liked successfully",
  "data": {
    "like": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "userId": "user-id",
      "storyId": "story-id",
      "createdAt": "2023-05-18T14:30:00.000Z",
      "updatedAt": "2023-05-18T14:30:00.000Z"
    },
    "likeCount": 42
  }
}
```

### Unlike Story

```
POST /api/story/unlikeStory
```

**Request Body:**

```json
{
  "data": {
    "storyId": "123e4567-e89b-12d3-a456-426614174000"
  }
}
```

**Response:**

```json
{
  "status": 200,
  "msg": "Story unliked successfully",
  "data": {
    "likeCount": 41
  }
}
```

### Add Comment

```
POST /api/story/commentStory
```

**Request Body:**

```json
{
  "data": {
    "storyId": "123e4567-e89b-12d3-a456-426614174000",
    "content": "This is my comment on the story",
    "parentId": "optional-parent-comment-id-for-replies"
  }
}
```

**Response:**

```json
{
  "status": 201,
  "msg": "Comment added successfully",
  "data": {
    "id": "comment-id",
    "storyId": "story-id",
    "userId": "user-id",
    "content": "This is my comment on the story",
    "parentId": null,
    "createdAt": "2023-05-18T14:30:00.000Z",
    "updatedAt": "2023-05-18T14:30:00.000Z",
    "User": {
      "id": "user-id",
      "username": "johndoe"
    }
  }
}
```

### Get Comments

```
POST /api/story/getComments
```

**Request Body:**

```json
{
  "data": {
    "storyId": "123e4567-e89b-12d3-a456-426614174000",
    "page": 1,
    "limit": 10
  }
}
```

**Response:**

```json
{
  "status": 200,
  "msg": "Comments retrieved successfully",
  "data": {
    "comments": [
      {
        "id": "comment-id-1",
        "storyId": "story-id",
        "userId": "user-id",
        "content": "This is a root comment",
        "parentId": null,
        "createdAt": "2023-05-18T14:30:00.000Z",
        "updatedAt": "2023-05-18T14:30:00.000Z",
        "User": {
          "id": "user-id",
          "username": "johndoe"
        },
        "replies": [
          {
            "id": "comment-id-2",
            "storyId": "story-id",
            "userId": "another-user-id",
            "content": "This is a reply to the root comment",
            "parentId": "comment-id-1",
            "createdAt": "2023-05-18T14:35:00.000Z",
            "updatedAt": "2023-05-18T14:35:00.000Z",
            "User": {
              "id": "another-user-id",
              "username": "janedoe"
            }
          }
        ],
        "replyCount": 1
      }
    ],
    "pagination": {
      "total": 42,
      "page": 1,
      "pages": 5
    }
  }
}
```

### Delete Comment

```
POST /api/story/deleteComment
```

**Request Body:**

```json
{
  "data": {
    "commentId": "123e4567-e89b-12d3-a456-426614174000"
  }
}
```

**Response:**

```json
{
  "status": 200,
  "msg": "Comment deleted successfully",
  "data": null
}
```

### Get Dashboard Stories

Retrieves a user's recent published stories and drafts for the dashboard view.

```
POST /api/story/getDashboardStories
```

**Request Body:**

```json
{
  "data": {
    "limit": 3 // Optional, defaults to 3
  }
}
```

**Response:**

```json
{
  "status": 200,
  "msg": "Dashboard stories retrieved successfully",
  "data": {
    "recentPublished": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "title": "My Latest Story",
        "content": "This is the content of the story",
        "userId": "user-id",
        "status": "published",
        "category": "travel",
        "tags": ["vacation", "summer"],
        "createdAt": "2023-06-15T14:30:00.000Z",
        "updatedAt": "2023-06-15T14:30:00.000Z",
        "media": [
          {
            "id": "media-id",
            "type": "image",
            "url": "https://cloudinary.url/image.jpg",
            "order": 0
          }
        ],
        "likeCount": 12,
        "commentCount": 5,
        "timeAgo": "2 days ago"
      }
      // Up to 3 recent published stories
    ],
    "recentDrafts": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174001",
        "title": "My Draft Story",
        "content": "This is a draft story I'm working on",
        "userId": "user-id",
        "status": "draft",
        "category": "technology",
        "tags": ["coding", "development"],
        "createdAt": "2023-06-14T10:20:00.000Z",
        "updatedAt": "2023-06-16T09:15:00.000Z",
        "media": [
          {
            "id": "media-id-2",
            "type": "image",
            "url": "https://cloudinary.url/draft-image.jpg",
            "order": 0
          }
        ],
        "timeAgo": "Yesterday"
      }
      // Up to 3 recent draft stories
    ]
  }
}
```

## Utility Endpoints

### Decrypt Response Data

```
POST /api/util/decrypt
```
