#!/bin/bash

# Deploy script for HamShackBuddy

# Exit on error
set -e

# Variables - Update these with your actual values
REMOTE_USER="root"  # or your username on the droplet
REMOTE_HOST="your-droplet-ip"  # your Digital Ocean droplet IP
REMOTE_DIR="/var/www/hamshackbuddy"  # path on server
NGINX_CONTAINER="nginx"  # Update with your actual nginx container name

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Deploying HamShackBuddy to ${REMOTE_HOST}...${NC}"

# Create remote directory if it doesn't exist
echo -e "${GREEN}Creating remote directory...${NC}"
ssh ${REMOTE_USER}@${REMOTE_HOST} "mkdir -p ${REMOTE_DIR}"

# Copy files to remote server
echo -e "${GREEN}Copying files to remote server...${NC}"
rsync -avz --exclude 'node_modules' --exclude '.next' --exclude '__pycache__' \
    --exclude 'venv' --exclude '.git' --exclude '.idea' \
    ./ ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}/

# SSH into remote server and execute commands
echo -e "${GREEN}Building and starting containers...${NC}"
ssh ${REMOTE_USER}@${REMOTE_HOST} "cd ${REMOTE_DIR} && \
    docker-compose -f docker-compose.prod.yml down && \
    docker-compose -f docker-compose.prod.yml up -d --build"

# Copy nginx configuration
echo -e "${GREEN}Updating nginx configuration...${NC}"
ssh ${REMOTE_USER}@${REMOTE_HOST} "cd ${REMOTE_DIR} && \
    docker cp nginx/hamshackbuddy.conf ${NGINX_CONTAINER}:/etc/nginx/conf.d/ && \
    docker exec ${NGINX_CONTAINER} nginx -s reload"

echo -e "${GREEN}Deployment completed successfully!${NC}"
echo -e "${YELLOW}Application should now be accessible at https://hamshackbuddy.bot-ai.dev${NC}"
echo -e "${YELLOW}Check logs with: ssh ${REMOTE_USER}@${REMOTE_HOST} \"docker logs hamshackbuddy-backend\"${NC}"