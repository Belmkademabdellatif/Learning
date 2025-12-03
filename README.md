<div align="center">

# 🎓 CodeLearn Platform

**Interactive Programming Learning with AI Assistance**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-E0234E?logo=nestjs&logoColor=white)](https://nestjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![OpenAI](https://img.shields.io/badge/OpenAI-412991?logo=openai&logoColor=white)](https://openai.com/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)

[🚀 Live Demo](#) • [📚 Documentation](./docs) • [🐛 Report Bug](../../issues) • [✨ Request Feature](../../issues)

A comprehensive interactive programming learning platform with AI-powered assistance, automated certificate generation, and real-time code execution.

</div>

---

## 🌟 Key Highlights

<table>
<tr>
<td width="50%">

### 🎓 For Learners
- ✅ Interactive lessons with examples
- ✅ Real-time code execution
- ✅ Instant feedback on challenges
- ✅ AI tutor available 24/7
- ✅ Track your progress
- ✅ Earn verified certificates

</td>
<td width="50%">

### 👨‍🏫 For Educators
- ✅ Create custom tracks
- ✅ Design coding challenges
- ✅ Monitor student progress
- ✅ Auto-grade submissions
- ✅ Manage content easily
- ✅ Export analytics

</td>
</tr>
</table>

---

## ✨ Features

### 🎯 Core Features
- 🎓 **Learning Tracks** - Structured courses with lessons and coding challenges
- 💻 **Live Code Editor** - Execute JavaScript & Python directly in browser
- 🤖 **AI Chatbot** - GPT-4 powered assistant with RAG for contextual help
- 📜 **Automated Certificates** - Daily PDF generation with QR verification codes
- 📊 **Progress Tracking** - Comprehensive dashboard showing learning analytics
- ✅ **Auto-Grading** - Instant feedback with detailed test results
- 👥 **Multi-Role System** - Students, instructors, and administrators
- 🔐 **Secure Authentication** - JWT + OAuth (Google, GitHub)
- 🔒 **Code Sandbox** - Docker-isolated execution environment

### 🚀 Technical Features
- ⚡ **Real-time Execution** - Sub-2s code execution
- 📱 **Responsive Design** - Mobile-friendly interface
- 🌐 **RESTful API** - 25+ endpoints with Swagger docs
- 🔄 **Auto-Deploy** - CI/CD with GitHub Actions
- 📈 **Scalable** - Kubernetes-ready architecture
- 🛡️ **OWASP Compliant** - Top 10 security standards

## Architecture

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Next.js   │ ───▶ │   NestJS    │ ───▶ │ PostgreSQL  │
│  Frontend   │      │   Backend   │      │  Database   │
└─────────────┘      └─────────────┘      └─────────────┘
                            │
                            ├───▶ Redis (Queue/Cache)
                            ├───▶ S3 (Certificates/Assets)
                            ├───▶ Weaviate (Vector DB)
                            └───▶ Docker (Code Sandbox)
```

## Tech Stack

### Frontend
- **Framework**: Next.js 14 + TypeScript
- **Styling**: TailwindCSS + shadcn/ui
- **Code Editor**: Monaco Editor
- **State**: React Query + Zustand
- **Auth**: NextAuth.js

### Backend
- **Framework**: NestJS + TypeScript
- **ORM**: Prisma
- **Database**: PostgreSQL 15
- **Cache/Queue**: Redis + BullMQ
- **Storage**: AWS S3 / MinIO
- **Vector DB**: Weaviate
- **PDF**: Puppeteer

### Infrastructure
- **Container**: Docker + Docker Compose
- **Orchestration**: Kubernetes
- **IaC**: Terraform
- **CI/CD**: GitHub Actions

## Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 15
- Redis 7

### Development Setup

1. **Clone and Install**
```bash
git clone <repository>
cd Learning
npm install
```

2. **Start Infrastructure**
```bash
docker-compose up -d
```

3. **Setup Database**
```bash
cd backend
npx prisma migrate dev
npx prisma db seed
```

4. **Start Backend**
```bash
cd backend
npm run start:dev
```

5. **Start Frontend**
```bash
cd frontend
npm run dev
```

6. **Access Platform**
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- API Docs: http://localhost:4000/api/docs

## Project Structure

```
Learning/
├── frontend/              # Next.js application
│   ├── app/              # App router pages
│   ├── components/       # React components
│   ├── lib/             # Utilities and configs
│   └── public/          # Static assets
├── backend/              # NestJS application
│   ├── src/
│   │   ├── auth/        # Authentication module
│   │   ├── tracks/      # Learning tracks
│   │   ├── lessons/     # Lesson management
│   │   ├── challenges/  # Coding challenges
│   │   ├── certificates/# Certificate generation
│   │   ├── chatbot/     # AI chatbot
│   │   ├── executor/    # Code execution sandbox
│   │   └── jobs/        # Scheduled jobs
│   └── prisma/          # Database schema
├── infra/               # Infrastructure as Code
│   ├── terraform/       # Terraform configurations
│   ├── k8s/            # Kubernetes manifests
│   └── docker/         # Dockerfiles
└── scripts/            # Utility scripts
```

## API Documentation

Full API documentation available at: `/api/docs` (Swagger UI)

### Key Endpoints

**Authentication**
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/refresh` - Refresh access token

**Learning Tracks**
- `GET /tracks` - List all tracks
- `POST /tracks/:id/enroll` - Enroll in track
- `GET /tracks/:id/progress` - Get track progress

**Lessons**
- `GET /lessons/:id` - Get lesson content
- `POST /lessons/:id/complete` - Mark lesson complete

**Challenges**
- `POST /challenges/:id/submit` - Submit solution
- `GET /challenges/:id/results` - Get results

**Certificates**
- `GET /certificates` - List user certificates
- `GET /certificates/:id/download` - Download PDF

**Chatbot**
- `POST /chat/query` - Ask question
- `GET /chat/history` - Get chat history

## Certificate Generation

Certificates are automatically generated daily at 23:59 server time for users who completed tracks that day.

### Manual Generation
```bash
npm run certificates:generate
```

### Certificate Features
- Unique verification code
- QR code for validation
- High-quality PDF (A4 landscape)
- S3 storage with signed URLs
- Email notification

## AI Chatbot

The RAG-based chatbot uses:
- **Embedding Model**: OpenAI text-embedding-3-small
- **LLM**: GPT-4 Turbo
- **Vector DB**: Weaviate
- **Context Window**: 8k tokens

### Reindex Content
```bash
npm run chatbot:reindex
```

## Deployment

### Docker Compose (Development)
```bash
docker-compose up -d
```

### Kubernetes (Production)
```bash
kubectl apply -f infra/k8s/
```

### Terraform (Cloud Infrastructure)
```bash
cd infra/terraform
terraform init
terraform plan
terraform apply
```

## Security

- ✅ JWT with refresh token rotation
- ✅ Rate limiting (100 req/min)
- ✅ CORS protection
- ✅ Helmet.js security headers
- ✅ SQL injection prevention (Prisma)
- ✅ XSS protection
- ✅ CSRF tokens
- ✅ Code execution sandboxing
- ✅ Input validation (class-validator)
- ✅ Secrets management (Vault/AWS Secrets)

## Testing

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

## Environment Variables

See `.env.example` for required environment variables.

## License

MIT

## Support

For issues and questions, please open a GitHub issue.
