# Deployment Guide

## Prerequisites

- Docker & Docker Compose
- Kubernetes cluster (for production)
- PostgreSQL 15+
- Redis 7+
- Node.js 18+
- Domain name with DNS configured

## Environment Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd Learning
```

### 2. Configure Environment Variables

```bash
cp .env.example .env
# Edit .env with your configuration
```

**Required Variables:**
```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/codelearn"

# JWT Secrets (generate with: openssl rand -base64 64)
JWT_SECRET="your-jwt-secret-64-characters-minimum"
JWT_REFRESH_SECRET="your-refresh-secret-64-characters-minimum"

# OpenAI
OPENAI_API_KEY="sk-your-api-key"

# OAuth (obtain from providers)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# S3 Storage
S3_ENDPOINT="https://s3.amazonaws.com"
S3_BUCKET_NAME="codelearn-certificates"
S3_ACCESS_KEY="your-access-key"
S3_SECRET_KEY="your-secret-key"
```

## Local Development

### Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Manual Setup

**Backend:**
```bash
cd backend
npm install
npx prisma migrate dev
npx prisma db seed
npm run start:dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

Access:
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- API Docs: http://localhost:4000/api/docs

## Production Deployment

### Option 1: Kubernetes (Recommended)

**1. Create Kubernetes Secrets**

```bash
kubectl create namespace codelearn

kubectl create secret generic codelearn-secrets \
  --from-literal=DATABASE_URL='postgresql://...' \
  --from-literal=JWT_SECRET='your-secret' \
  --from-literal=OPENAI_API_KEY='sk-...' \
  --namespace=codelearn
```

**2. Deploy Application**

```bash
kubectl apply -f infra/k8s/deployment.yaml
```

**3. Verify Deployment**

```bash
kubectl get pods -n codelearn
kubectl get services -n codelearn
kubectl get ingress -n codelearn
```

**4. Configure DNS**

Point your domain to the ingress LoadBalancer IP:
```bash
kubectl get ingress -n codelearn
```

### Option 2: Docker Swarm

**1. Initialize Swarm**

```bash
docker swarm init
```

**2. Deploy Stack**

```bash
docker stack deploy -c docker-compose.prod.yml codelearn
```

**3. Scale Services**

```bash
docker service scale codelearn_backend=3
docker service scale codelearn_frontend=2
```

### Option 3: Cloud Platforms

#### AWS ECS

```bash
# Build and push images
docker build -t codelearn/backend ./backend
docker tag codelearn/backend:latest <ecr-url>/codelearn-backend:latest
docker push <ecr-url>/codelearn-backend:latest

# Deploy using ECS CLI or AWS Console
```

#### Google Cloud Run

```bash
# Backend
gcloud run deploy codelearn-backend \
  --image gcr.io/<project>/codelearn-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated

# Frontend
gcloud run deploy codelearn-frontend \
  --image gcr.io/<project>/codelearn-frontend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

#### Vercel (Frontend Only)

```bash
cd frontend
vercel --prod
```

## Database Management

### Migrations

```bash
cd backend

# Create migration
npx prisma migrate dev --name migration_name

# Apply to production
npx prisma migrate deploy
```

### Seeding

```bash
npx prisma db seed
```

### Backups

**Automated Backup (cron)**

```bash
# Add to crontab
0 2 * * * pg_dump -U codelearn codelearn > /backups/codelearn_$(date +\%Y\%m\%d).sql
```

**Manual Backup**

```bash
pg_dump -U codelearn -h localhost codelearn > backup.sql
```

**Restore**

```bash
psql -U codelearn -h localhost codelearn < backup.sql
```

## SSL/TLS Configuration

### Let's Encrypt with cert-manager

```bash
# Install cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Create ClusterIssuer
kubectl apply -f infra/k8s/cert-issuer.yaml
```

### Manual SSL

```bash
# Generate certificate
certbot certonly --standalone -d codelearn.com -d api.codelearn.com

# Configure Nginx
ssl_certificate /etc/letsencrypt/live/codelearn.com/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/codelearn.com/privkey.pem;
```

## Monitoring & Logging

### Prometheus + Grafana

```bash
kubectl apply -f infra/k8s/monitoring.yaml
```

### Application Logging

Logs are sent to:
- **Development**: Console
- **Production**: CloudWatch / Stackdriver / Elasticsearch

### Health Checks

- Backend: `GET /health`
- Frontend: `GET /api/health`

## Performance Optimization

### CDN Configuration

```bash
# CloudFront
aws cloudfront create-distribution \
  --origin-domain-name codelearn.com

# Cloudflare
# Configure via dashboard
```

### Redis Caching

Enabled by default for:
- API responses
- User sessions
- Track listings

### Database Optimization

```sql
-- Add indexes
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_track_slug ON tracks(slug);
CREATE INDEX idx_enrollment_user_track ON enrollments(user_id, track_id);

-- Connection pooling
max_connections = 100
shared_buffers = 256MB
```

## Troubleshooting

### Backend Not Starting

```bash
# Check logs
docker logs codelearn-backend

# Common issues:
# - Database connection failed: Verify DATABASE_URL
# - Port already in use: Change API_PORT
# - Missing env vars: Check .env file
```

### Frontend Build Errors

```bash
# Clear cache
rm -rf .next node_modules
npm install
npm run build
```

### Database Connection Issues

```bash
# Test connection
psql -U codelearn -h localhost -d codelearn

# Check firewall
telnet <db-host> 5432
```

### Certificate Generation Failing

```bash
# Check Puppeteer
npm run test:pdf

# Verify S3 access
aws s3 ls s3://codelearn-certificates/
```

## Scaling Guidelines

### Horizontal Scaling

```bash
# Kubernetes
kubectl scale deployment backend --replicas=5 -n codelearn

# Docker Swarm
docker service scale codelearn_backend=5
```

### Vertical Scaling

Update resource limits in `deployment.yaml`:

```yaml
resources:
  requests:
    memory: "1Gi"
    cpu: "500m"
  limits:
    memory: "2Gi"
    cpu: "1000m"
```

### Database Scaling

- Read replicas for queries
- Connection pooling (PgBouncer)
- Partitioning for large tables

## Rollback Procedure

### Kubernetes

```bash
# Rollback to previous version
kubectl rollout undo deployment/backend -n codelearn

# Rollback to specific revision
kubectl rollout undo deployment/backend --to-revision=2 -n codelearn
```

### Docker

```bash
# Redeploy previous image
docker service update --image codelearn/backend:previous codelearn_backend
```

## CI/CD Pipeline

GitHub Actions workflow automatically:
1. Runs tests on PR
2. Builds Docker images on merge to main
3. Pushes to container registry
4. Deploys to Kubernetes cluster

### Manual Deploy

```bash
# Trigger deployment
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
```

## Support

For deployment issues:
- Check documentation: `/docs`
- Review logs: `kubectl logs` or `docker logs`
- Contact: support@codelearn.com
