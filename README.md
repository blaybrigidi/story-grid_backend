# StoryGrid Application

A Node.js application with PostgreSQL database hosted on Neon.

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Neon account
- PostgreSQL client (optional, for direct database access)
- Git

## Setup Instructions

### 1. Neon Database Setup

1. Go to the [Neon Console](https://console.neon.tech)
2. Create a new project or select an existing one
3. Create a new database (or use the default one)
4. Get your connection string from the Neon dashboard

### 2. Database Configuration

1. Update the `.env` file with your Neon database credentials:
   ```
   DB_NAME=storygrid_db
   DB_USER=neondb_owner
   DB_PASSWORD=your_password
   DB_HOST=your_neon_host.aws.neon.tech
   DB_PORT=5432
   DB_DIALECT=postgres
   DB_SSL=true
   ```

### 3. Application Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create database tables:

   ```bash
   npm run create-tables
   ```

3. (Optional) Create test users:

   ```bash
   npm run create-test-users
   ```

4. Start the application:
   ```bash
   npm start
   ```

### 4. Connecting to the Database

#### Using Neon Connection String

1. Get your connection string from the Neon dashboard
2. Use it with any PostgreSQL client:
   ```
   postgresql://username:password@hostname/database?sslmode=require
   ```

### 5. Environment Variables

Check the .env file for the related details

````

### 6. API Endpoints

#### Authentication

- POST `/api/auth/register` - Register a new user
- POST `/api/auth/login` - Login user
- GET `/api/auth/user` - Get current user info
- POST `/api/auth/logout` - Logout user

#### Stories

- GET `/api/stories` - Get all stories
- GET `/api/stories/:id` - Get a specific story
- POST `/api/stories` - Create a new story
- PUT `/api/stories/:id` - Update a story
- DELETE `/api/stories/:id` - Delete a story

#### Comments

- GET `/api/stories/:storyId/comments` - Get comments for a story
- POST `/api/stories/:storyId/comments` - Add a comment to a story
- PUT `/api/comments/:id` - Update a comment
- DELETE `/api/comments/:id` - Delete a comment

#### Likes

- POST `/api/stories/:storyId/like` - Like a story
- DELETE `/api/stories/:storyId/like` - Unlike a story

#### Friendships

- GET `/api/friends` - Get user's friends
- POST `/api/friends/:friendId` - Send friend request
- PUT `/api/friends/:friendId` - Accept/reject friend request
- DELETE `/api/friends/:friendId` - Remove friend

### 7. Development

To run the application in development mode with hot reloading:

```bash
npm run dev
````

### 8. Testing

To run tests:

```bash
npm test
```

## License

ISC
