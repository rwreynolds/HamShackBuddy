# HamShackBuddy Deployment Guide

This guide provides step-by-step instructions for deploying the HamShackBuddy application on your existing Digital Ocean droplet alongside your AIagg application.

## Prerequisites

- Digital Ocean droplet with Docker and Docker Compose already installed
- Existing nginx container running on the droplet
- Domain `bot-ai.dev` with DNS configured to point to your droplet
- Ability to create A records for the subdomain `hamshackbuddy.bot-ai.dev`

## Deployment Steps

### 1. DNS Configuration

First, ensure your DNS is properly configured:

1. In your domain registrar or DNS provider, create an A record:
   - **Name/Host**: `hamshackbuddy`
   - **Value/Points to**: Your Digital Ocean droplet IP
   - **TTL**: 3600 (or as preferred)

### 2. Prepare Locally

1. Update the deployment script with your details:
   ```bash
   # Edit deploy.sh
   nano deploy.sh
   ```

   Update the following variables with your actual values:
   ```bash
   REMOTE_USER="your-username"  # typically 'root' on Digital Ocean
   REMOTE_HOST="your-droplet-ip"  # e.g., 123.45.67.89
   REMOTE_DIR="/var/www/hamshackbuddy"  # path on server
   NGINX_CONTAINER="nginx"  # your nginx container name
   ```

2. Check your backend environment variables:
   ```bash
   # Ensure your backend/.env file has all necessary variables
   # At minimum:
   OPENAI_API_KEY=your_openai_api_key
   ASSISTANT_ID=your_openai_assistant_id
   ```

### 3. Run the Deployment Script

1. Make the script executable and run it:
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

2. This will:
   - Copy all files to your droplet
   - Build and start Docker containers
   - Set up Nginx configuration

### 4. Set Up SSL Certificate

If you don't already have a certificate for the subdomain, SSH into your droplet and run:

```bash
# SSH into your droplet
ssh your-username@your-droplet-ip

# Stop the nginx container temporarily (if needed)
docker stop nginx

# Run certbot in standalone mode
certbot certonly --standalone -d hamshackbuddy.bot-ai.dev

# Start nginx again
docker start nginx
```

If you prefer to use the webroot method with your running nginx:

```bash
docker run -it --rm \
  -v /etc/letsencrypt:/etc/letsencrypt \
  -v /var/lib/letsencrypt:/var/lib/letsencrypt \
  -v /var/www/certbot:/var/www/certbot \
  certbot/certbot certonly --webroot \
  -w /var/www/certbot \
  -d hamshackbuddy.bot-ai.dev
```

### 5. Verify the Deployment

1. Check that your containers are running:
   ```bash
   docker ps | grep hamshackbuddy
   ```

2. Check the logs for any errors:
   ```bash
   docker logs hamshackbuddy-backend
   docker logs hamshackbuddy-frontend
   ```

3. Visit your site at https://hamshackbuddy.bot-ai.dev to confirm it's working.

### 6. Troubleshooting

If your application isn't working correctly:

1. **Check Nginx configuration**:
   ```bash
   docker exec nginx nginx -t
   ```

2. **Check connectivity between containers**:
   ```bash
   docker network inspect nginx-network
   ```

3. **Verify the containers are on the correct network**:
   ```bash
   docker inspect hamshackbuddy-backend | grep -A 10 Networks
   docker inspect hamshackbuddy-frontend | grep -A 10 Networks
   ```

4. **Check if the ports are correctly exposed**:
   ```bash
   docker exec hamshackbuddy-backend netstat -tulpn
   docker exec hamshackbuddy-frontend netstat -tulpn
   ```

5. **Test internal access**:
   ```bash
   docker exec nginx curl -I http://hamshackbuddy-frontend:3000
   docker exec nginx curl -I http://hamshackbuddy-backend:8001
   ```

## Maintenance

### Updating the Application

To update the application:

1. Make your changes locally
2. Run the deployment script again:
   ```bash
   ./deploy.sh
   ```

### Backup

Regularly backup your environment files and any important data:

```bash
# From your droplet
cd /var/www/hamshackbuddy
cp backend/.env backend/.env.backup
```

### Monitoring

Consider setting up basic monitoring for your application:

```bash
# Check CPU and memory usage
docker stats hamshackbuddy-backend hamshackbuddy-frontend

# Set up a simple health check cron job
echo '*/5 * * * * curl -s -o /dev/null -w "%{http_code}" https://hamshackbuddy.bot-ai.dev/ | grep -q "200" || echo "Site down" | mail -s "HamShackBuddy Alert" your@email.com' | crontab -
```