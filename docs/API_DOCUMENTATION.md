# CodeLearn API Documentation

## Base URL

```
Production: https://api.codelearn.com
Development: http://localhost:4000
```

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <access_token>
```

### Token Refresh

Access tokens expire after 15 minutes. Use the refresh token to obtain a new access token.

## API Endpoints

### Authentication

#### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "user": {
    "id": "cuid123",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "STUDENT"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### POST /auth/login
Login with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

#### POST /auth/refresh
Refresh access token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### GET /auth/me
Get current user profile (requires authentication).

---

### Learning Tracks

#### GET /tracks
Get all published tracks.

**Query Parameters:**
- `difficulty` (optional): Filter by difficulty (BEGINNER, INTERMEDIATE, ADVANCED, EXPERT)
- `tags` (optional): Comma-separated tags

**Response:**
```json
[
  {
    "id": "track1",
    "title": "JavaScript Fundamentals",
    "slug": "javascript-fundamentals",
    "description": "Master the fundamentals of JavaScript",
    "difficulty": "BEGINNER",
    "estimatedHours": 20,
    "tags": ["javascript", "programming"],
    "_count": {
      "lessons": 10,
      "enrollments": 1523
    }
  }
]
```

#### GET /tracks/:id
Get track details including lessons.

#### POST /tracks/:id/enroll
Enroll in a track (requires authentication).

#### GET /tracks/:id/progress
Get user's progress in a track (requires authentication).

---

### Lessons

#### GET /lessons/:id
Get lesson content and challenges.

**Response:**
```json
{
  "id": "lesson1",
  "title": "Introduction to JavaScript",
  "content": "# Introduction\n\nJavaScript is...",
  "estimatedMinutes": 30,
  "challenges": [
    {
      "id": "challenge1",
      "title": "Sum Two Numbers",
      "difficulty": "BEGINNER",
      "points": 10
    }
  ],
  "isCompleted": false
}
```

#### POST /lessons/:id/complete
Mark lesson as complete (requires authentication).

---

### Challenges

#### GET /challenges/:id
Get challenge details.

**Response:**
```json
{
  "id": "challenge1",
  "title": "Sum Two Numbers",
  "description": "Write a function that sums two numbers",
  "difficulty": "BEGINNER",
  "points": 10,
  "language": "JAVASCRIPT",
  "starterCode": "function sum(a, b) {\n  // Your code here\n}",
  "hints": ["Use the + operator"],
  "testCases": [
    {
      "input": { "a": 1, "b": 2 },
      "expected": 3,
      "description": "Sum of 1 and 2",
      "isHidden": false
    }
  ]
}
```

#### GET /challenges/:id/submissions
Get user's submission history for a challenge.

---

### Submissions

#### POST /submissions
Submit code solution.

**Request Body:**
```json
{
  "challengeId": "challenge1",
  "code": "function sum(a, b) {\n  return a + b;\n}"
}
```

**Response:**
```json
{
  "id": "submission1",
  "status": "PENDING",
  "score": 0,
  "submittedAt": "2024-01-15T10:30:00Z"
}
```

#### GET /submissions/:id
Get submission results.

**Response:**
```json
{
  "id": "submission1",
  "status": "PASSED",
  "score": 100,
  "executionTime": 45,
  "testResults": {
    "passed": 10,
    "failed": 0,
    "total": 10,
    "details": [...]
  }
}
```

---

### Certificates

#### GET /certificates
Get user's certificates (requires authentication).

#### POST /certificates/generate
Generate certificate for completed track.

**Query Parameters:**
- `trackId`: Track ID

#### GET /certificates/:id/download
Download certificate PDF.

**Response:**
```json
{
  "url": "https://s3.../certificate.pdf?signature=..."
}
```

#### GET /certificates/verify/:code
Verify certificate by verification code (public endpoint).

**Response:**
```json
{
  "valid": true,
  "userName": "John Doe",
  "trackTitle": "JavaScript Fundamentals",
  "issuedAt": "2024-01-15T00:00:00Z"
}
```

---

### AI Chatbot

#### POST /chat/query
Ask the AI chatbot a question (requires authentication).

**Request Body:**
```json
{
  "message": "How do I use async/await in JavaScript?"
}
```

**Response:**
```json
{
  "id": "msg1",
  "message": "How do I use async/await in JavaScript?",
  "response": "async/await is a modern way to handle asynchronous operations...",
  "sources": [
    {
      "type": "lesson",
      "title": "Asynchronous JavaScript"
    }
  ]
}
```

#### GET /chat/history
Get chat history (requires authentication).

---

## Error Responses

All errors follow this format:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

### Common Status Codes

- `200` OK - Request successful
- `201` Created - Resource created
- `400` Bad Request - Invalid input
- `401` Unauthorized - Missing or invalid token
- `403` Forbidden - Insufficient permissions
- `404` Not Found - Resource not found
- `429` Too Many Requests - Rate limit exceeded
- `500` Internal Server Error - Server error

## Rate Limiting

API is rate-limited to 100 requests per minute per IP address.

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642245600
```

## Pagination

Endpoints that return lists support pagination:

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

**Response:**
```json
{
  "data": [...],
  "meta": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}
```

## Webhooks

Webhook events can be configured for:
- Track completion
- Certificate generation
- New enrollments

Contact support to configure webhooks.
