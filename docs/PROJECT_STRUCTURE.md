# Project Structure

## Complete File Tree

```
Learning/
│
├── README.md                      # Project overview and quick start
├── .env.example                   # Environment variables template
├── .gitignore                     # Git ignore rules
├── docker-compose.yml             # Local development setup
├── package.json                   # Root workspace configuration
│
├── backend/                       # NestJS Backend Application
│   ├── prisma/
│   │   ├── schema.prisma         # Database schema definition
│   │   ├── seed.ts               # Database seeding script
│   │   └── migrations/           # Database migrations
│   │
│   ├── src/
│   │   ├── main.ts               # Application entry point
│   │   ├── app.module.ts         # Root application module
│   │   │
│   │   ├── auth/                 # Authentication module
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── dto/
│   │   │   │   └── auth.dto.ts
│   │   │   ├── guards/
│   │   │   │   ├── jwt-auth.guard.ts
│   │   │   │   └── roles.guard.ts
│   │   │   └── strategies/
│   │   │       ├── jwt.strategy.ts
│   │   │       ├── google.strategy.ts
│   │   │       └── github.strategy.ts
│   │   │
│   │   ├── tracks/               # Learning tracks module
│   │   │   ├── tracks.module.ts
│   │   │   ├── tracks.service.ts
│   │   │   └── tracks.controller.ts
│   │   │
│   │   ├── lessons/              # Lessons module
│   │   │   ├── lessons.module.ts
│   │   │   ├── lessons.service.ts
│   │   │   └── lessons.controller.ts
│   │   │
│   │   ├── challenges/           # Coding challenges module
│   │   │   ├── challenges.module.ts
│   │   │   ├── challenges.service.ts
│   │   │   └── challenges.controller.ts
│   │   │
│   │   ├── submissions/          # Code submission module
│   │   │   ├── submissions.module.ts
│   │   │   ├── submissions.service.ts
│   │   │   └── submissions.controller.ts
│   │   │
│   │   ├── executor/             # Code execution sandbox
│   │   │   ├── executor.module.ts
│   │   │   └── executor.service.ts
│   │   │
│   │   ├── certificates/         # Certificate generation
│   │   │   ├── certificates.module.ts
│   │   │   ├── certificates.service.ts
│   │   │   ├── certificates.controller.ts
│   │   │   ├── pdf.service.ts
│   │   │   └── s3.service.ts
│   │   │
│   │   ├── chatbot/              # AI chatbot with RAG
│   │   │   ├── chatbot.module.ts
│   │   │   ├── chatbot.service.ts
│   │   │   ├── chatbot.controller.ts
│   │   │   ├── vector.service.ts
│   │   │   └── openai.service.ts
│   │   │
│   │   ├── jobs/                 # Scheduled jobs
│   │   │   ├── jobs.module.ts
│   │   │   └── certificate-generator.job.ts
│   │   │
│   │   └── common/               # Shared utilities
│   │       ├── prisma/
│   │       │   ├── prisma.module.ts
│   │       │   └── prisma.service.ts
│   │       ├── guards/
│   │       ├── decorators/
│   │       └── filters/
│   │
│   ├── test/                     # E2E tests
│   ├── package.json
│   ├── tsconfig.json
│   ├── nest-cli.json
│   └── Dockerfile
│
├── frontend/                     # Next.js Frontend Application
│   ├── app/                      # Next.js 14 App Router
│   │   ├── layout.tsx           # Root layout
│   │   ├── page.tsx             # Home page
│   │   ├── providers.tsx        # React Query provider
│   │   ├── globals.css          # Global styles
│   │   │
│   │   ├── dashboard/           # User dashboard
│   │   ├── tracks/              # Track pages
│   │   ├── lessons/             # Lesson viewer
│   │   ├── challenges/          # Challenge interface
│   │   └── certificates/        # Certificate viewer
│   │
│   ├── components/              # React components
│   │   ├── ui/                  # UI primitives
│   │   ├── layout/              # Layout components
│   │   ├── code-editor/
│   │   │   └── MonacoEditor.tsx
│   │   └── chatbot/
│   │       └── ChatWidget.tsx
│   │
│   ├── lib/                     # Utilities
│   │   ├── api-client.ts       # API client with auth
│   │   └── utils.ts
│   │
│   ├── public/                  # Static assets
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── Dockerfile.dev
│
├── infra/                       # Infrastructure as Code
│   ├── k8s/                     # Kubernetes manifests
│   │   ├── deployment.yaml     # App deployments
│   │   ├── service.yaml        # Services
│   │   ├── ingress.yaml        # Ingress rules
│   │   └── secrets.yaml        # Secrets (not committed)
│   │
│   ├── terraform/              # Terraform IaC
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   │
│   └── docker/                 # Docker utilities
│       └── Dockerfile.executor # Code executor container
│
├── .github/                    # GitHub specific
│   └── workflows/
│       └── ci-cd.yml          # CI/CD pipeline
│
├── scripts/                    # Utility scripts
│   ├── backup-db.sh
│   ├── restore-db.sh
│   └── deploy.sh
│
└── docs/                       # Documentation
    ├── API_DOCUMENTATION.md    # API reference
    ├── DATABASE_SCHEMA.md      # Database design
    ├── SECURITY.md             # Security guide
    ├── DEPLOYMENT.md           # Deployment guide
    ├── MVP_TIMELINE.md         # Sprint plan
    └── PROJECT_STRUCTURE.md    # This file
```

## Module Responsibilities

### Backend Modules

**auth/** - Authentication & Authorization
- User registration and login
- JWT token management
- OAuth integration (Google, GitHub)
- Role-based access control

**tracks/** - Learning Track Management
- Track CRUD operations
- Enrollment management
- Progress tracking

**lessons/** - Lesson Content
- Lesson delivery
- Completion tracking
- Content rendering

**challenges/** - Coding Challenges
- Challenge management
- Test case definition
- Difficulty levels

**submissions/** - Code Submissions
- Code submission handling
- Grading coordination
- Result storage

**executor/** - Code Execution Sandbox
- Secure code execution
- Docker container management
- Resource limits and timeouts

**certificates/** - Certificate Generation
- PDF certificate creation
- QR code generation
- S3 storage management
- Verification system

**chatbot/** - AI Assistant
- RAG implementation
- Vector database integration
- OpenAI API integration
- Context retrieval

**jobs/** - Scheduled Tasks
- Nightly certificate generation
- Retry failed jobs
- Cleanup tasks

### Frontend Structure

**app/** - Next.js Pages
- File-based routing
- Server and client components
- API routes

**components/** - Reusable Components
- UI primitives
- Feature components
- Layout components

**lib/** - Utilities
- API client
- Helper functions
- Type definitions

## Data Flow

### User Registration Flow
```
Frontend (Register Form)
    ↓
Backend (auth/register)
    ↓
Prisma (User.create)
    ↓
PostgreSQL
    ↓
JWT Token Generation
    ↓
Frontend (Store token)
```

### Code Submission Flow
```
Frontend (Monaco Editor)
    ↓
Backend (submissions/submit)
    ↓
Executor Service
    ↓
Docker Container
    ↓
Test Execution
    ↓
Results to Frontend
```

### Certificate Generation Flow
```
Cron Job (23:59 daily)
    ↓
Find completed tracks
    ↓
PDF Service (Puppeteer)
    ↓
QR Code Generation
    ↓
S3 Upload
    ↓
Database Update
    ↓
Email Notification
```

### AI Chatbot Flow
```
User Question
    ↓
Vector Search (Weaviate)
    ↓
Retrieve Context
    ↓
OpenAI API (GPT-4)
    ↓
Response with Sources
```

## Technology Stack Summary

### Backend
- **Framework**: NestJS
- **Language**: TypeScript
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Cache**: Redis
- **Queue**: BullMQ
- **Storage**: AWS S3
- **Vector DB**: Weaviate
- **PDF**: Puppeteer
- **Execution**: Docker

### Frontend
- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Editor**: Monaco
- **State**: React Query + Zustand
- **Forms**: React Hook Form

### Infrastructure
- **Containers**: Docker
- **Orchestration**: Kubernetes
- **CI/CD**: GitHub Actions
- **Monitoring**: Prometheus + Grafana
- **Logging**: Winston + ELK

## Environment Variables

See `.env.example` for complete list of required environment variables.

### Critical Variables
- `DATABASE_URL` - PostgreSQL connection
- `JWT_SECRET` - Authentication secret
- `OPENAI_API_KEY` - AI chatbot
- `S3_*` - Certificate storage
- `REDIS_URL` - Caching and queues

## Scripts

### Backend
```bash
npm run start:dev      # Development server
npm run build          # Production build
npm run test           # Unit tests
npm run test:e2e       # E2E tests
npx prisma migrate dev # Run migrations
npx prisma db seed     # Seed database
```

### Frontend
```bash
npm run dev            # Development server
npm run build          # Production build
npm run start          # Production server
npm run lint           # Lint code
```

### Docker
```bash
docker-compose up -d   # Start all services
docker-compose logs -f # View logs
docker-compose down    # Stop all services
```

## API Endpoints

See `/docs/API_DOCUMENTATION.md` for complete API reference.

### Base URLs
- **Development**: http://localhost:4000
- **Production**: https://api.codelearn.com

### Main Endpoints
- `/auth/*` - Authentication
- `/tracks/*` - Learning tracks
- `/lessons/*` - Lessons
- `/challenges/*` - Challenges
- `/submissions/*` - Code submissions
- `/certificates/*` - Certificates
- `/chat/*` - AI chatbot

## Testing Strategy

### Unit Tests
- Service layer logic
- Utility functions
- Validation logic

### Integration Tests
- API endpoints
- Database operations
- External service integration

### E2E Tests
- Complete user flows
- Critical paths
- Cross-module workflows

## Security

See `/docs/SECURITY.md` for comprehensive security documentation.

### Key Security Features
- JWT authentication
- Rate limiting
- CORS protection
- Input validation
- SQL injection prevention
- XSS protection
- Code execution sandboxing
- Encrypted storage

## Deployment

See `/docs/DEPLOYMENT.md` for detailed deployment instructions.

### Deployment Targets
- **Development**: Docker Compose
- **Staging**: Kubernetes (staging namespace)
- **Production**: Kubernetes (production namespace)

## Contributing

1. Create feature branch
2. Implement changes
3. Write tests
4. Update documentation
5. Submit pull request
6. Pass CI/CD checks
7. Code review
8. Merge to main

## License

MIT License - see LICENSE file
