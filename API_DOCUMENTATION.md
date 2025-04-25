# StoryGrid API Documentation

## Authentication

All endpoints except login and signup require authentication via JWT token.
Pass the token in the Authorization header as: `Bearer YOUR_TOKEN`

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
