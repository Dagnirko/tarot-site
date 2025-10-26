#!/bin/bash

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "🔐 Setting up SSL certificates with Let's Encrypt"
echo ""

# Check if domain is set
DOMAIN="tarot.dagnir.ru"
EMAIL=""

read -p "Enter your email for Let's Encrypt notifications: " EMAIL

if [ -z "$EMAIL" ]; then
    echo -e "${RED}Email is required!${NC}"
    exit 1
fi

echo -e "${YELLOW}Installing certbot...${NC}"
sudo apt-get update
sudo apt-get install -y certbot

# Create directory for SSL certificates
mkdir -p nginx/ssl

# Stop nginx if running
echo -e "${YELLOW}Stopping nginx temporarily...${NC}"
docker-compose stop nginx || true

# Obtain certificate
echo -e "${YELLOW}Obtaining SSL certificate...${NC}"
sudo certbot certonly --standalone \
    -d $DOMAIN \
    --email $EMAIL \
    --agree-tos \
    --non-interactive

# Copy certificates
echo -e "${YELLOW}Copying certificates...${NC}"
sudo cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem nginx/ssl/
sudo cp /etc/letsencrypt/live/$DOMAIN/privkey.pem nginx/ssl/
sudo chmod 644 nginx/ssl/*.pem

# Start nginx
echo -e "${YELLOW}Starting nginx...${NC}"
docker-compose up -d nginx

echo ""
echo -e "${GREEN}✅ SSL certificates installed successfully!${NC}"
echo ""
echo "📝 Certificate will expire in 90 days."
echo "To renew, run: sudo certbot renew"
echo ""
echo "To set up auto-renewal, add this to crontab:"
echo "0 0 * * * certbot renew --quiet && cp /etc/letsencrypt/live/$DOMAIN/*.pem /path/to/nginx/ssl/ && docker-compose restart nginx"
echo ""