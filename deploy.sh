#!/bin/bash

set -e

echo "🚀 Starting Tarot Website Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env.docker exists
if [ ! -f .env.docker ]; then
    echo -e "${RED}Error: .env.docker file not found!${NC}"
    echo "Please create .env.docker file with required environment variables."
    exit 1
fi

echo "📦 Stopping existing containers..."
docker-compose down

# Build images
echo "🔨 Building Docker images..."
docker-compose build --no-cache

# Start services
echo "🚀 Starting services..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Check if services are running
echo "✅ Checking service status..."
docker-compose ps

# Create admin user
echo "👤 Creating admin user..."
docker-compose exec backend python3 -c "
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from datetime import datetime, timezone
import uuid
import os

pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')

async def create_admin():
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://mongodb:27017')
    db_name = os.environ.get('DB_NAME', 'tarot_astro_site')
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    existing_admin = await db.users.find_one({'username': 'admin'})
    if existing_admin:
        print('Admin user already exists!')
        return
    
    admin_user = {
        'id': str(uuid.uuid4()),
        'username': 'admin123',
        'email': 'admin123@example.com',
        'password_hash': pwd_context.hash('admin123'),
        'created_at': datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(admin_user)
    print('✅ Admin user created successfully!')
    print('Username: admin')
    print('Password: admin123')
    print('\n⚠️  Please change the password after first login!')
    
    client.close()

asyncio.run(create_admin())
" || echo -e "${YELLOW}Admin user might already exist or will be created on first backend start${NC}"

echo ""
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo "📝 Important Information:"
echo "  - Website: https://tarot.dagnir.ru"
echo "  - Admin Panel: https://tarot.dagnir.ru/admin/login"
echo "  - Username: admin"
echo "  - Password: admin123"
echo ""
echo "⚠️  Remember to:"
echo "  1. Change admin password after first login"
echo "  2. Configure SendGrid API key in .env.docker for email notifications"
echo "  3. Set up SSL certificates if not done yet"
echo ""
echo "🔧 Useful commands:"
echo "  - View logs: docker-compose logs -f"
echo "  - Restart: docker-compose restart"
echo "  - Stop: docker-compose down"
echo "  - Rebuild: docker-compose build --no-cache"
echo ""