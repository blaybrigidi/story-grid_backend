# StoryGrid Application

A Node.js application with PostgreSQL database hosted on Google Cloud SQL.

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Google Cloud account
- Google Cloud SQL instance
- PostgreSQL client (optional, for direct database access)
- Google Cloud SDK (gcloud CLI)
- Git

## Setup Instructions

### 1. Google Cloud SQL Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Enable the Cloud SQL Admin API
4. Create a new Cloud SQL instance:
   - Choose PostgreSQL
   - Select your preferred region
   - Choose a machine type (start with db-f1-micro for development)
   - Set up your root password
   - Configure networking (allow your IP address)
   - Create the instance

# run in a separate terminal ./cloud-sql-proxy storygrid:us-central1:storygrid-dev-db-instance-2026 --port 3306

# before running npm run dev

### 2. Database Configuration

1. Get your instance connection information:

   - Instance IP address
   - Database name
   - Username and password

2. Update the `.env` file with your database credentials:
   ```
   DB_NAME=your_database_name
   DB_USER=your_username
   DB_PASSWORD=your_password
   DB_HOST=your_instance_ip
   DB_PORT=5432
   DB_SSL=true
   ```

### 3. Application Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Run database migrations:

   ```bash
   npm run migrate
   ```

3. Start the application:
   ```bash
   npm start
   ```

### 4. Connecting to the Database

#### Using gcloud CLI

1. Install the Google Cloud SDK from [here](https://cloud.google.com/sdk/docs/install)

2. Initialize gcloud and authenticate:

   ```bash
   gcloud init
   gcloud auth login
   ```

3. Set your project:

   ```bash
   gcloud config set project storygrid
   ```

4. List your Cloud SQL instances:

   ```bash
   gcloud sql instances list --project storygrid
   ```

5. Connect to your instance:
   ```bash
   gcloud sql connect storygrid-dev-db-instance-2026 --user=root
   ```
   Note: This will temporarily allowlist your IP address for 5 minutes.

#### Using Cloud SQL Proxy (Recommended for Production)

1. Download and install the Cloud SQL Proxy:

   ```bash
   curl -o cloud-sql-proxy https://dl.google.com/cloudsql/cloud-sql-proxy.linux.amd64
   chmod +x cloud-sql-proxy
   ```

2. Start the proxy:

   ```bash
   ./cloud-sql-proxy storygrid:us-central1-a:storygrid-dev-db-instance-2026
   ```

3. Connect to the database using a PostgreSQL client:
   ```bash
   psql -h 127.0.0.1 -U your_username -d your_database_name
   ```

### 5. GitHub Repository Setup

1. Initialize Git in your project (if not already done):

   ```bash
   git init
   ```

2. Create a `.gitignore` file to exclude sensitive files:

   ```
   # Dependencies
   node_modules/
   npm-debug.log
   yarn-debug.log
   yarn-error.log

   # Environment variables
   .env
   .env.local
   .env.*.local

   # IDE
   .idea/
   .vscode/
   *.swp
   *.swo

   # OS
   .DS_Store
   Thumbs.db

   # Logs
   logs/
   *.log

   # Build output
   dist/
   build/
   ```

3. Add your files and make your first commit:

   ```bash
   git add .
   git commit -m "Initial commit"
   ```

4. Connect to your GitHub repository:

   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git branch -M main
   git push -u origin main
   ```

5. For subsequent updates:
   ```bash
   git add .
   git commit -m "Your commit message"
   git push
   ```

Note: Make sure to never commit sensitive information like API keys, database credentials, or environment variables. Always use the `.env` file for such configurations.

## Environment Variables

The following environment variables are required:

- `DB_NAME`: Database name
- `DB_USER`: Database username
- `DB_PASSWORD`: Database password
- `DB_HOST`: Database host (Google Cloud SQL instance IP)
- `DB_PORT`: Database port (default: 5432)
- `DB_SSL`: Enable SSL for database connection (true/false)
- `NODE_ENV`: Application environment (development/production)
- `JWT_SECRET`: Secret key for JWT token generation
- `JWT_EXPIRES_IN`: JWT token expiration time
- `EMAIL_SERVICE`: Email service provider
- `EMAIL_USER`: Email address for sending OTP
- `EMAIL_PASSWORD`: Email password or app-specific password

## Security Notes

1. Never commit the `.env` file to version control
2. Use strong passwords for database access
3. Configure Google Cloud SQL firewall rules to allow only necessary IP addresses
4. Enable SSL for database connections in production
5. Regularly rotate database credentials and JWT secrets
6. For production environments, use Cloud SQL Proxy instead of direct connections

## Troubleshooting

If you encounter connection issues:

1. Verify your Google Cloud SQL instance is running
2. Check your firewall rules in Google Cloud Console
3. Ensure your database credentials are correct
4. Verify SSL configuration if enabled
5. Check the application logs for detailed error messages
6. If using gcloud CLI, ensure your IP is allowlisted
7. For Cloud SQL Proxy issues, check the proxy logs and ensure you have the correct instance connection name
