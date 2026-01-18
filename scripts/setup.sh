#!/bin/bash

# Multi-AI-at-Once Setup Script
# This script helps you set up the environment for local development or production

set -e

echo "🚀 Multi-AI-at-Once Setup Script"
echo "================================"
echo ""

# Check if .env file exists
if [ -f "packages/web/.env.local" ]; then
    echo "✅ .env.local file already exists"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Skipping environment setup..."
    else
        setup_env=true
    fi
else
    setup_env=true
fi

if [ "$setup_env" = true ]; then
    echo "📝 Setting up environment variables..."

    # Generate random secrets
    BETTER_AUTH_SECRET=$(openssl rand -hex 32)
    ENCRYPTION_KEY=$(openssl rand -hex 32)

    # Create .env.local file
    cat > packages/web/.env.local << EOF
# Database
DATABASE_URL="postgres://multi-ai:multi-ai-password@localhost:5432/multi-ai"

# Better Auth
BETTER_AUTH_SECRET="$BETTER_AUTH_SECRET"
BETTER_AUTH_URL="http://localhost:3000"

# Encryption for AI service cookies
ENCRYPTION_KEY="$ENCRYPTION_KEY"

# OAuth (optional - leave empty to disable)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
EOF

    echo "✅ Environment file created at packages/web/.env.local"
    echo ""
    echo "🔐 Generated secrets (save these somewhere safe!):"
    echo "   BETTER_AUTH_SECRET: $BETTER_AUTH_SECRET"
    echo "   ENCRYPTION_KEY: $ENCRYPTION_KEY"
    echo ""
fi

# Ask if user wants to use Docker
echo ""
read -p "Do you want to use Docker for PostgreSQL? (Y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Nn]$ ]]; then
    use_docker=false
    echo "⚠️  You'll need to set up PostgreSQL manually and update DATABASE_URL in packages/web/.env.local"
else
    use_docker=true
fi

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
pnpm install

# Run database migrations
echo ""
echo "🗄️  Setting up database..."
if [ "$use_docker" = true ]; then
    echo "Starting PostgreSQL with Docker..."
    docker-compose up -d postgres

    echo "Waiting for PostgreSQL to be ready..."
    sleep 5

    echo "Running database migrations..."
    cd packages/web && pnpm db:push && cd ../..
else
    echo "Please ensure PostgreSQL is running and DATABASE_URL is correctly set"
    read -p "Press Enter to continue with migrations..."

    echo "Running database migrations..."
    cd packages/web && pnpm db:push && cd ../..
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "🎉 You can now start the development server:"
echo ""
if [ "$use_docker" = true ]; then
    echo "   With Docker PostgreSQL:"
    echo "   docker-compose up -d  # Start PostgreSQL"
    echo "   pnpm --filter @multi-ai/web dev  # Start web app"
else
    echo "   pnpm --filter @multi-ai/web dev"
fi
echo ""
echo "📖 Documentation:"
echo "   - Local: http://localhost:3000"
echo "   - API: http://localhost:3000/api"
echo "   - Auth: http://localhost:3000/auth/sign-in"
echo ""
echo "🔧 Useful commands:"
echo "   pnpm db:generate    # Generate database migrations"
echo "   pnpm db:push        # Push schema changes to database"
echo "   pnpm db:studio      # Open Drizzle Studio"
echo "   pnpm dev            # Start development server"
echo "   pnpm build          # Build for production"
echo ""
