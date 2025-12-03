# Database Schema Documentation

## Overview

The CodeLearn platform uses PostgreSQL as the primary database with Prisma ORM. The schema is designed to support:
- Multi-role user management
- Hierarchical learning content (Tracks → Lessons → Challenges)
- Progress tracking and completions
- Automated certificate generation
- AI chatbot with vector embeddings
- Comprehensive activity logging

## Entity Relationship Diagram

```
┌─────────────┐
│    User     │
│─────────────│
│ id          │──┐
│ email       │  │
│ password    │  │
│ firstName   │  │
│ lastName    │  │
│ role        │  │
│ authProvider│  │
└─────────────┘  │
       │         │
       │         │
       ├─────────┼──────────────────┐
       │         │                  │
       ▼         ▼                  ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ Enrollment  │ │ Completion  │ │ Certificate │
│─────────────│ │─────────────│ │─────────────│
│ userId      │ │ userId      │ │ userId      │
│ trackId     │ │ lessonId    │ │ trackId     │
│ progress    │ │ completedAt │ │ pdfUrl      │
└─────────────┘ └─────────────┘ │ qrCodeUrl   │
       │                         │ verification│
       │                         └─────────────┘
       ▼
┌─────────────┐
│    Track    │
│─────────────│
│ id          │──┐
│ title       │  │
│ difficulty  │  │
│ tags        │  │
└─────────────┘  │
       │         │
       ▼         ▼
┌─────────────┐ ┌─────────────┐
│   Lesson    │ │  Challenge  │
│─────────────│ │─────────────│
│ id          │─│ lessonId    │
│ title       │ │ title       │
│ content     │ │ testCases   │
│ orderIndex  │ │ language    │
└─────────────┘ └─────────────┘
                       │
                       ▼
                ┌─────────────┐
                │ Submission  │
                │─────────────│
                │ userId      │
                │ challengeId │
                │ code        │
                │ status      │
                │ score       │
                └─────────────┘

┌─────────────┐      ┌──────────────┐
│ChatMessage  │      │VectorDocument│
│─────────────│      │──────────────│
│ userId      │      │ contentType  │
│ message     │      │ contentId    │
│ response    │      │ vectorId     │
│ context     │      │ content      │
└─────────────┘      └──────────────┘
```

## Core Tables

### users
Stores all user accounts with support for multiple authentication providers.

| Column | Type | Description |
|--------|------|-------------|
| id | String (CUID) | Primary key |
| email | String | Unique email address |
| password | String? | Hashed password (nullable for OAuth) |
| firstName | String | User's first name |
| lastName | String | User's last name |
| avatar | String? | Profile picture URL |
| role | Enum | STUDENT, INSTRUCTOR, ADMIN |
| authProvider | Enum | LOCAL, GOOGLE, GITHUB |
| emailVerified | Boolean | Email verification status |
| isActive | Boolean | Account active status |
| createdAt | DateTime | Account creation timestamp |
| updatedAt | DateTime | Last update timestamp |
| lastLoginAt | DateTime? | Last login timestamp |

**Indexes:**
- `email` (unique)
- `role`

### tracks
Learning tracks containing ordered lessons and challenges.

| Column | Type | Description |
|--------|------|-------------|
| id | String (CUID) | Primary key |
| title | String | Track title |
| slug | String | URL-friendly identifier |
| description | String | Track description |
| coverImage | String? | Cover image URL |
| difficulty | Enum | BEGINNER, INTERMEDIATE, ADVANCED, EXPERT |
| estimatedHours | Int | Estimated completion time |
| tags | String[] | Searchable tags |
| prerequisites | String[] | Required prior tracks |
| isPublished | Boolean | Publication status |
| createdById | String | Creator user ID |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |

**Indexes:**
- `slug` (unique)
- `isPublished`
- `difficulty`

### lessons
Individual learning units within tracks.

| Column | Type | Description |
|--------|------|-------------|
| id | String (CUID) | Primary key |
| title | String | Lesson title |
| slug | String | URL-friendly identifier |
| description | String | Lesson description |
| content | Text | Markdown/HTML content |
| orderIndex | Int | Position in track |
| estimatedMinutes | Int | Estimated time |
| videoUrl | String? | Optional video URL |
| isPublished | Boolean | Publication status |
| trackId | String | Parent track ID |
| createdById | String | Creator user ID |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |

**Indexes:**
- `(trackId, slug)` (unique)
- `(trackId, orderIndex)`

### challenges
Coding exercises with automated testing.

| Column | Type | Description |
|--------|------|-------------|
| id | String (CUID) | Primary key |
| title | String | Challenge title |
| description | Text | Problem description |
| difficulty | Enum | Challenge difficulty |
| points | Int | Points awarded |
| language | Enum | Programming language |
| starterCode | Text | Initial code template |
| solutionCode | Text | Reference solution |
| testCases | JSON | Test case definitions |
| hints | String[] | Helpful hints |
| orderIndex | Int | Position in lesson |
| lessonId | String | Parent lesson ID |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |

**Test Cases JSON Structure:**
```json
[
  {
    "input": "params",
    "expected": "output",
    "description": "Test case description",
    "isHidden": false
  }
]
```

### submissions
User code submissions and results.

| Column | Type | Description |
|--------|------|-------------|
| id | String (CUID) | Primary key |
| code | Text | Submitted code |
| language | Enum | Programming language |
| status | Enum | PENDING, RUNNING, PASSED, FAILED, ERROR, TIMEOUT |
| score | Int | Points earned (0-100) |
| executionTime | Int? | Execution time (ms) |
| memoryUsed | Int? | Memory used (bytes) |
| testResults | JSON | Detailed results |
| errorMessage | Text? | Error details |
| challengeId | String | Challenge ID |
| userId | String | User ID |
| submittedAt | DateTime | Submission timestamp |

**Test Results JSON Structure:**
```json
{
  "passed": 8,
  "failed": 2,
  "total": 10,
  "details": [
    {
      "testId": "1",
      "passed": true,
      "executionTime": 45,
      "input": "...",
      "expected": "...",
      "actual": "..."
    }
  ]
}
```

### enrollments
User enrollment in learning tracks.

| Column | Type | Description |
|--------|------|-------------|
| id | String (CUID) | Primary key |
| userId | String | User ID |
| trackId | String | Track ID |
| progress | JSON | Progress tracking |
| lastAccessedAt | DateTime | Last access time |
| completedAt | DateTime? | Completion time |
| enrolledAt | DateTime | Enrollment time |

**Progress JSON Structure:**
```json
{
  "lessonsCompleted": ["lesson_id_1", "lesson_id_2"],
  "challengesCompleted": ["challenge_id_1"],
  "currentLessonId": "lesson_id_3",
  "percentComplete": 45
}
```

### completions
Individual lesson completions.

| Column | Type | Description |
|--------|------|-------------|
| id | String (CUID) | Primary key |
| userId | String | User ID |
| lessonId | String | Lesson ID |
| completedAt | DateTime | Completion timestamp |

**Unique Constraint:** `(userId, lessonId)`

### certificates
Generated certificates for track completion.

| Column | Type | Description |
|--------|------|-------------|
| id | String (CUID) | Primary key |
| userId | String | User ID |
| trackId | String | Track ID |
| verificationCode | String | Unique verification code |
| qrCodeUrl | String? | QR code image URL |
| pdfUrl | String? | Certificate PDF URL |
| status | Enum | PENDING, GENERATED, FAILED |
| issuedAt | DateTime | Issue timestamp |
| generatedAt | DateTime? | Generation timestamp |
| expiresAt | DateTime? | Expiration timestamp |

**Unique Constraints:**
- `verificationCode`
- `(userId, trackId)`

### chat_messages
AI chatbot conversation history.

| Column | Type | Description |
|--------|------|-------------|
| id | String (CUID) | Primary key |
| userId | String | User ID |
| message | Text | User's question |
| response | Text | AI's response |
| context | JSON? | Retrieved RAG context |
| metadata | JSON? | Model info, tokens |
| createdAt | DateTime | Message timestamp |

### vector_documents
Document embeddings for RAG.

| Column | Type | Description |
|--------|------|-------------|
| id | String (CUID) | Primary key |
| contentType | String | 'lesson', 'track', 'challenge' |
| contentId | String | Reference ID |
| content | Text | Document content |
| metadata | JSON | Additional metadata |
| vectorId | String? | Weaviate UUID |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Update timestamp |

## Enums

### UserRole
- `STUDENT` - Regular learner
- `INSTRUCTOR` - Can create content
- `ADMIN` - Full system access

### AuthProvider
- `LOCAL` - Email/password
- `GOOGLE` - Google OAuth
- `GITHUB` - GitHub OAuth

### Difficulty
- `BEGINNER` - Entry level
- `INTERMEDIATE` - Some experience
- `ADVANCED` - Strong foundation
- `EXPERT` - Professional level

### ProgrammingLanguage
- `JAVASCRIPT`
- `PYTHON`
- `TYPESCRIPT`
- `JAVA`
- `CPP` (C++)
- `GO`
- `RUST`

### SubmissionStatus
- `PENDING` - Queued
- `RUNNING` - Executing
- `PASSED` - All tests passed
- `FAILED` - Some tests failed
- `ERROR` - Execution error
- `TIMEOUT` - Exceeded time limit

### CertificateStatus
- `PENDING` - Awaiting generation
- `GENERATED` - Successfully created
- `FAILED` - Generation failed

## Indexes Strategy

### Performance Indexes
- User lookups: `users.email`, `users.role`
- Content browsing: `tracks.slug`, `tracks.isPublished`, `lessons.trackId`
- Progress queries: `enrollments.userId`, `completions.userId`
- Certificate verification: `certificates.verificationCode`
- Chat history: `chat_messages.userId`, `chat_messages.createdAt`

### Composite Indexes
- `(lessons.trackId, lessons.orderIndex)` - Ordered lesson queries
- `(submissions.userId, submissions.challengeId)` - User submission history

## Data Integrity

### Cascade Deletes
- Deleting a user cascades to enrollments, submissions, completions, certificates
- Deleting a track cascades to lessons
- Deleting a lesson cascades to challenges
- Deleting a challenge cascades to submissions

### Unique Constraints
- User email addresses
- Track and lesson slugs
- Certificate verification codes
- One certificate per user per track
- One completion per user per lesson

## Migration Strategy

### Initial Migration
```bash
npx prisma migrate dev --name init
```

### Adding New Fields
```bash
npx prisma migrate dev --name add_field_name
```

### Seeding Data
```bash
npx prisma db seed
```

## Backup & Recovery

### Daily Backups
```bash
pg_dump -U codelearn codelearn > backup_$(date +%Y%m%d).sql
```

### Point-in-Time Recovery
Enable WAL archiving in PostgreSQL configuration.

## Performance Considerations

1. **Connection Pooling**: Use Prisma connection pool (default: 10 connections)
2. **Query Optimization**: Use `select` to limit returned fields
3. **Pagination**: Always paginate large result sets
4. **Caching**: Cache frequently accessed data in Redis
5. **Indexes**: Monitor slow queries and add indexes as needed

## Security

1. **Password Hashing**: bcrypt with salt rounds = 12
2. **SQL Injection**: Prevented by Prisma's query builder
3. **Data Encryption**: Encrypt sensitive fields at application layer
4. **Access Control**: Row-level security for multi-tenant data
