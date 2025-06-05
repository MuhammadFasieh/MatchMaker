# MatchMaker

MatchMaker is a full-stack web application designed to help users manage their experiences, research, and personal statements. It includes features for uploading CVs, tracking experiences, and using AI to enhance user content.

## Project Structure

The project is organized into two main directories:
- `Frontend/` - React frontend built with Vite
- `backend/` - Node.js Express backend

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or higher)
- npm or pnpm (package manager)
- MongoDB (local instance or connection URI)

## Installation

Follow these steps to set up the project on a new device:

### 1. Clone the Repository

```bash
git clone <repository-url>
cd MatchMaker
```

### 2. Set Up Backend

```bash
cd backend

# Install dependencies
npm install
# or with pnpm
pnpm install

# Create .env file
touch .env
```

Configure your `.env` file with the following variables:

```
NODE_ENV=development
PORT=5001
MONGO_URI=mongodb://localhost:27017/matchmaker
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=30d
OPENAI_API_KEY=your_openai_api_key
```

### 3. Set Up Frontend

```bash
cd ../Frontend

# Install dependencies
npm install
# or with pnpm
pnpm install
```

## Running the Application

### Start Backend Server

```bash
cd backend
npm run dev
```

This will start the backend server on port 5001.

### Start Frontend Development Server

```bash
cd Frontend
npm run dev
```

This will start the frontend development server, typically on port 5173.

## Usage Guide

### 1. Authentication

- Register a new account or log in with existing credentials
- User sessions are managed with JWT tokens

### 2. User Dashboard

- View your profile and application progress
- Access different sections of the application

### 3. Experiences Section

The Experiences section allows you to:
- Upload your CV for automatic parsing of experiences
- Manually add, edit, and delete experiences
- Select and highlight meaningful experiences
- Get AI-powered insights on your experiences

Important: Experiences are user-specific and stored both in the database and locally in your browser. If you switch to a new user account, the application will clear the local storage and load the new user's experiences.

### 4. Personal Statement

- Create and edit your personal statement
- Use AI assistance to enhance your content
- Download your statement as a PDF

### 5. Research Products

- Add and manage your research publications, presentations, and other scholarly work
- Track status and details of each research product

## API Endpoints

The backend provides the following main API routes:
- `/api/auth` - Authentication and user management
- `/api/experiences` - Create, read, update, and delete experiences
- `/api/personal-statement` - Manage personal statement content
- `/api/research` - Track research products
- `/api/programs` - Manage program preferences

## Deployment

### Backend

To build the backend for production:

```bash
cd backend
npm start
```

### Frontend

To build the frontend for production:

```bash
cd Frontend
npm run build
```

This will generate a `dist` folder with static assets that can be served by any web server.

## Troubleshooting

### Local Storage Issues
- Clear your browser's local storage if you encounter data from previous sessions
- Each user should only see their own data

### Connection Issues
- Make sure MongoDB is running and accessible
- Check that the backend server is running on port 5001
- Ensure CORS is properly configured if connecting from different domains

## Development Notes

- The frontend uses React 19 with the latest React Router
- Tailwind CSS is used for styling
- The backend uses Express with MongoDB via Mongoose
- Authentication is handled with JWT tokens

## License

This project is licensed under the ISC License. 