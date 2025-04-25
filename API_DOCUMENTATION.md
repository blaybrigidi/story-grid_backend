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

## Utility Endpoints

### Decrypt Response Data

```
POST /api/util/decrypt
```

**Request Body:**

```json
{
  "data": {
    "encryptedData": "iv:encrypted-data-string"
  }
}
```

**Response:**

```json
{
  "status": 200,
  "msg": "Data decrypted successfully",
  "data": {
    // Decrypted data object
  }
}
```
