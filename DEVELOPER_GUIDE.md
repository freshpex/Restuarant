# Tim's Kitchen - Developer Guide

This guide provides detailed technical information for developers working on the Tim's Kitchen platform.

## Architecture Overview

Tim's Kitchen follows a client-server architecture with:

- **Frontend**: React.js with Redux for state management
- **Backend**: Express.js API with MongoDB database
- **Storage**: Supabase for image storage
- **Authentication**: Firebase Authentication
- **Payment Processing**: Flutterwave

### System Diagram

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│                 │      │                 │      │                 │
│     React       │◄────►│    Express.js   │◄────►│    MongoDB      │
│    Frontend     │      │      API        │      │    Database     │
│                 │      │                 │      │                 │
└────────┬────────┘      └────────┬────────┘      └─────────────────┘
         │                        │
         │                        │
         ▼                        ▼
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│                 │      │                 │      │                 │
│    Firebase     │      │    Supabase     │      │   Flutterwave   │
│  Authentication │      │     Storage     │      │     Payments    │
│                 │      │                 │      │                 │
└─────────────────┘      └─────────────────┘      └─────────────────┘
```

## Data Flow

1. **User Authentication**:

   - Frontend calls Firebase Auth
   - Firebase returns token
   - Token sent to backend for verification and JWT generation
   - JWT stored in local storage and used for authentication

2. **Food Management**:

   - Food data stored in MongoDB
   - Images uploaded to Supabase
   - Frontend fetches food data from backend API

3. **Order Process**:
   - User places order through frontend
   - Order data sent to backend
   - Payment processed through Flutterwave
   - Order stored in MongoDB
   - Notifications sent (via WhatsApp or email)

## Frontend Technical Details

### State Management

The Redux store is organized into slices:

```javascript
// Store Configuration
const store = configureStore({
  reducer: {
    auth: authReducer,
    food: foodReducer,
    foodActions: foodActionsReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});
```

Key slices:

- **authSlice**: Handles user authentication, token management
- **foodSlice**: Manages food items, food details
- **foodActionsSlice**: Handles actions like adding food, ordering, etc.
- **uiSlice**: Manages UI state like loading spinners, modals, etc.

### Component Structure

Components follow these patterns:

- Functional components with hooks
- Container/Presentational pattern for complex components
- Route-based code splitting
- Custom hooks for reusable logic

### Code Guidelines

- Use functional components with hooks
- Implement proper error handling
- Use async/await for asynchronous operations
- Implement loading states for API calls
- Write descriptive prop types
- Follow the container/presentational pattern where applicable

## Backend Technical Details

### API Structure

The API follows RESTful principles and is organized by resource type:

- `/api/foods` - Food management endpoints
- `/api/users` - User management endpoints
- `/api/orders` - Order management endpoints
- `/api/auth` - Authentication endpoints

### Middleware Stack

1. CORS handling
2. JSON parsing
3. Cookie parsing
4. Request logging
5. Authentication verification (on protected routes)
6. Route handlers
7. Error handling

### Authentication Flow

```
┌────────────┐     ┌────────────┐     ┌────────────┐     ┌────────────┐
│            │     │            │     │            │     │            │
│  Frontend  │────►│  Firebase  │────►│  Backend   │────►│  MongoDB   │
│            │     │    Auth    │     │            │     │            │
└────────────┘     └────────────┘     └────────────┘     └────────────┘
       ▲                                     │
       │                                     │
       └─────────────────────────────────────┘
                    JWT Token
```

1. User logs in via Firebase in the frontend
2. Frontend receives Firebase ID token
3. Token sent to backend `/api/jwt` endpoint
4. Backend verifies token with Firebase Admin SDK
5. Backend issues a JWT token
6. Frontend stores JWT token in localStorage
7. JWT token sent with subsequent API requests

### Database Models

Key collection structures:

**foods Collection**:

```javascript
{
  _id: ObjectId,
  foodName: String,
  foodPrice: String,
  foodCategory: String,
  foodDescription: String,
  foodOrigin: String,
  foodQuantity: String,
  foodImage: String,
  email: String,
  buyerName: String,
  createdAt: Date,
  updatedAt: Date,
  orderCount: Number
}
```

**orders Collection**:

```javascript
{
  _id: ObjectId,
  foodId: String,
  foodName: String,
  foodPrice: String,
  foodImage: String,
  quantity: Number,
  totalPrice: String,
  buyerName: String,
  email: String,
  userEmail: String,
  date: String,
  createdAt: Date,
  status: String
}
```

### File Upload Implementation

Files are uploaded using Multer and stored in Supabase:

```javascript
// Upload flow
1. File received via multipart/form-data
2. Processed by Multer middleware
3. File buffer sent to Supabase storage
4. Public URL generated and returned
5. URL stored in database with the resource
```

## Environment Setup

### Development Environment

1. **Frontend**:

   ```bash
   cd timkitchenFrontend
   npm install
   cp .env.example .env
   # Edit .env with appropriate values
   npm run dev
   ```

2. **Backend**:
   ```bash
   cd timkitchenBackend
   npm install
   cp .env.example .env
   # Edit .env with appropriate values
   npm run dev
   ```

### Configuration Files

**Frontend** (.env):

```
VITE_API_URL=http://localhost:5000/api
VITE_API_KEY=your_firebase_api_key
VITE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_PROJECT_ID=your-project
VITE_STORAGE_BUCKET=your-project.appspot.com
VITE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_APP_ID=your_app_id
VITE_FLUTTERWAVE_PUBLIC_KEY=your_flutterwave_key
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SUPABASE_BUCKET_NAME=your_bucket_name
```

**Backend** (.env):

```
MONGODB_URI=your_mongodb_uri
DB_ACCESS_SECRET_TOKEN=your_jwt_secret_token
PORT=5000
NODE_ENV=development
SUPABASE_S3_ENDPOINT=your_supabase_endpoint
SUPABASE_S3_REGION=your_region
SUPABASE_S3_KEY_ID=your_key_id
SUPABASE_S3_SECRET_KEY=your_secret_key
SUPABASE_S3_BUCKET_NAME=your_bucket_name
SUPABASE_S3_PUBLIC_IMAGE_ENDPOINT=your_public_endpoint
```

## Testing

### Frontend Testing

```bash
cd timkitchenFrontend
npm test
```

Key testing approaches:

- React Testing Library for component tests
- Jest for unit tests
- Mock Service Worker for API mocking

### Backend Testing

```bash
cd timkitchenBackend
npm test
```

Key testing approaches:

- Mocha and Chai for API testing
- MongoDB memory server for database testing
- Supertest for endpoint testing

## Troubleshooting Common Issues

### Frontend Issues

1. **Authentication Errors**:

   - Check Firebase configuration in `.env` file
   - Ensure token is being properly stored in localStorage
   - Verify token is being sent in Authorization header

2. **Image Upload Issues**:
   - Check Supabase configuration
   - Verify CORS settings in Supabase
   - Check file size limits

### Backend Issues

1. **Database Connection Issues**:

   - Verify MongoDB connection string
   - Check IP whitelist in MongoDB Atlas
   - Ensure proper error handling in database.js

2. **JWT Verification Failures**:

   - Check JWT secret in environment variables
   - Verify token format in Authorization header
   - Check token expiration

3. **File Upload Errors**:
   - Check Supabase credentials
   - Verify bucket exists and has proper permissions
   - Check file size limits in Multer configuration

## Performance Considerations

1. **Frontend Optimization**:

   - Implement code splitting
   - Lazy load images
   - Use memoization for expensive computations
   - Implement proper virtual list rendering for large datasets

2. **Backend Optimization**:
   - Implement database indexing
   - Use projection in MongoDB queries
   - Implement caching for frequently accessed data
   - Use compression middleware

## Security Best Practices

1. **Frontend Security**:

   - Store tokens securely
   - Implement CSRF protection
   - Sanitize user input
   - Don't expose sensitive information in client-side code

2. **Backend Security**:
   - Use HTTPS in production
   - Implement rate limiting
   - Use proper validation for all inputs
   - Set secure HTTP headers
   - Implement proper CORS configuration
   - Use secure cookies with HttpOnly flag

## Deployment Strategy

### Frontend Deployment

Recommended platform: Vercel

```bash
npm run build
vercel --prod
```

### Backend Deployment

Recommended platform: Render, Railway, or Heroku

```bash
npm run build
# Follow platform-specific deployment instructions
```

## Contributing Guidelines

1. Fork the repository
2. Create a feature branch
3. Follow code style guidelines
4. Write tests for new features
5. Ensure all tests pass
6. Submit pull request with detailed description

## Version Control Workflow

We follow GitHub Flow:

1. Create feature branches from main
2. Submit pull requests to main
3. Require code review before merging
4. Deploy from main branch
