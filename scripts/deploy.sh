#!/bin/bash

# CodeLearn Deployment Script
# Usage: ./scripts/deploy.sh [railway|render|vercel]

set -e

PLATFORM=${1:-railway}
FRONTEND_DIR="frontend"
BACKEND_DIR="backend"

echo "🚀 CodeLearn Deployment Script"
echo "================================"
echo "Platform: $PLATFORM"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

check_requirements() {
    print_info "Checking requirements..."

    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        exit 1
    fi
    print_success "Node.js installed: $(node -v)"

    # Check Git
    if ! command -v git &> /dev/null; then
        print_error "Git is not installed"
        exit 1
    fi
    print_success "Git installed"

    echo ""
}

generate_secrets() {
    print_info "Generating secure secrets..."

    JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
    JWT_REFRESH_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
    NEXTAUTH_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")

    print_success "Secrets generated"
    echo ""
}

deploy_railway() {
    print_info "Deploying to Railway..."

    # Check if Railway CLI is installed
    if ! command -v railway &> /dev/null; then
        print_error "Railway CLI not installed"
        echo "Install it with: npm install -g @railway/cli"
        exit 1
    fi

    # Login to Railway
    print_info "Logging in to Railway..."
    railway login

    # Initialize project
    print_info "Initializing Railway project..."
    railway init

    # Add PostgreSQL
    print_info "Adding PostgreSQL database..."
    railway add --database postgres

    # Set environment variables
    print_info "Setting environment variables..."
    railway variables set NODE_ENV=production
    railway variables set JWT_SECRET="$JWT_SECRET"
    railway variables set JWT_REFRESH_SECRET="$JWT_REFRESH_SECRET"

    # Deploy
    print_info "Deploying application..."
    railway up

    # Get the URL
    RAILWAY_URL=$(railway domain)

    print_success "Deployment complete!"
    echo ""
    echo "🎉 Your platform is live at: $RAILWAY_URL"
    echo ""
}

deploy_render() {
    print_info "Preparing for Render deployment..."

    # Create render.yaml if it doesn't exist
    if [ ! -f "render.yaml" ]; then
        print_info "Creating render.yaml..."
        cat > render.yaml << 'EOF'
services:
  - type: web
    name: codelearn-backend
    env: docker
    dockerfilePath: ./backend/Dockerfile
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        fromDatabase:
          name: codelearn-db
          property: connectionString
      - key: JWT_SECRET
        generateValue: true
      - key: JWT_REFRESH_SECRET
        generateValue: true

  - type: web
    name: codelearn-frontend
    env: node
    buildCommand: cd frontend && npm install && npm run build
    startCommand: cd frontend && npm start
    envVars:
      - key: NEXT_PUBLIC_API_URL
        value: https://codelearn-backend.onrender.com

databases:
  - name: codelearn-db
    databaseName: codelearn
    user: codelearn
EOF
        print_success "render.yaml created"
    fi

    print_success "Render configuration ready"
    echo ""
    echo "📝 Next steps for Render:"
    echo "1. Go to https://render.com"
    echo "2. Click 'New +' → 'Blueprint'"
    echo "3. Connect your GitHub repository"
    echo "4. Render will detect render.yaml automatically"
    echo "5. Click 'Apply'"
    echo ""
}

deploy_vercel() {
    print_info "Deploying Frontend to Vercel..."

    # Check if Vercel CLI is installed
    if ! command -v vercel &> /dev/null; then
        print_error "Vercel CLI not installed"
        echo "Install it with: npm install -g vercel"
        exit 1
    fi

    # Deploy frontend
    cd $FRONTEND_DIR

    print_info "Deploying to Vercel..."
    vercel --prod

    cd ..

    print_success "Frontend deployed to Vercel"
    echo ""
    echo "📝 Don't forget to:"
    echo "1. Deploy backend to Render/Railway"
    echo "2. Update NEXT_PUBLIC_API_URL in Vercel settings"
    echo ""
}

setup_database() {
    print_info "Setting up database..."

    cd $BACKEND_DIR

    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        print_info "Installing backend dependencies..."
        npm install
    fi

    # Run migrations
    print_info "Running database migrations..."
    npx prisma migrate deploy

    # Seed database
    print_info "Seeding database..."
    npx prisma db seed

    cd ..

    print_success "Database setup complete"
    echo ""
}

display_env_vars() {
    echo ""
    echo "📋 Environment Variables to set:"
    echo "================================"
    echo ""
    echo "# Authentication"
    echo "JWT_SECRET=$JWT_SECRET"
    echo "JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET"
    echo "NEXTAUTH_SECRET=$NEXTAUTH_SECRET"
    echo ""
    echo "# Database (will be provided by hosting platform)"
    echo "DATABASE_URL=<from_railway_or_render>"
    echo ""
    echo "# API URLs (update after deployment)"
    echo "NEXT_PUBLIC_API_URL=https://your-backend-url"
    echo "CORS_ORIGIN=https://your-frontend-url"
    echo ""
    echo "# Optional: OpenAI (for chatbot)"
    echo "OPENAI_API_KEY=sk-your-key-here"
    echo ""
    echo "# Optional: OAuth"
    echo "GOOGLE_CLIENT_ID=your-client-id"
    echo "GOOGLE_CLIENT_SECRET=your-client-secret"
    echo "GITHUB_CLIENT_ID=your-client-id"
    echo "GITHUB_CLIENT_SECRET=your-client-secret"
    echo ""
}

# Main execution
main() {
    echo ""
    check_requirements
    generate_secrets

    case $PLATFORM in
        railway)
            deploy_railway
            ;;
        render)
            deploy_render
            ;;
        vercel)
            deploy_vercel
            ;;
        *)
            print_error "Unknown platform: $PLATFORM"
            echo "Usage: ./scripts/deploy.sh [railway|render|vercel]"
            exit 1
            ;;
    esac

    display_env_vars

    echo "✅ Deployment process complete!"
    echo ""
    echo "📚 For detailed instructions, see: docs/QUICK_DEPLOY.md"
    echo ""
}

# Run main function
main
