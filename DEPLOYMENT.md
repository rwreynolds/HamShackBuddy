# Deployment Instructions for HamShackBuddy

This guide will help you deploy the HamShackBuddy application on your DigitalOcean droplet alongside your existing applications.

## Prerequisites

- Existing DigitalOcean droplet
- Docker and Docker Compose installed on the droplet
- An existing Nginx container running
- Existing AIAgg application running in Docker (with backend on port 8000)
- Domain/subdomain (hamshackbuddy.bot-ai.dev) pointing to your droplet

## Deployment Steps

1. **SSH into your droplet**

   ```bash
   ssh your-user@your-droplet-ip
   ```

2. **Create a directory for the application**

   ```bash
   mkdir -p /path/to/hamshackbuddy
   cd /path/to/hamshackbuddy
   ```

3. **Copy the application files to the droplet**

   There are several ways to do this:

   - Using SCP:
     ```bash
     scp -r /local/path/to/hamshackbuddy/* your-user@your-droplet-ip:/path/to/hamshackbuddy/
     ```
   - Using Git (if you have it in a repository):
     ```bash
     git clone your-repo-url .
     ```

4. **Verify your Docker network setup**

   Check existing networks:
   ```bash
   docker network ls
   ```

   Find the network that your existing Nginx container is on:
   ```bash
   docker inspect nginx-container | grep -A 10 Networks
   ```

   Make sure to update the `docker-compose.yml` file if your nginx network has a different name than "nginx-network".

5. **Build and start the containers**

   ```bash
   docker-compose up -d
   ```

6. **Update Nginx Configuration**

   Assuming your existing Nginx container is named `nginx-container` and mounts a volume for configuration:

   ```bash
   # Copy the hamshackbuddy.conf to your nginx conf.d directory
   docker cp nginx/hamshackbuddy.conf nginx-container:/etc/nginx/conf.d/
   
   # Reload nginx configuration
   docker exec nginx-container nginx -s reload
   ```

7. **Set up SSL with Certbot** (if you haven't already)

   ```bash
   docker run -it --rm \
     -v /etc/letsencrypt:/etc/letsencrypt \
     -v /var/lib/letsencrypt:/var/lib/letsencrypt \
     certbot/certbot certonly --webroot \
     -w /var/www/certbot \
     -d hamshackbuddy.bot-ai.dev
   ```

8. **Update Nginx to use SSL**

   Modify your `hamshackbuddy.conf` to include SSL configuration:

   ```nginx
   server {
       listen 80;
       server_name hamshackbuddy.bot-ai.dev;
       return 301 https://$host$request_uri;
   }

   server {
       listen 443 ssl;
       server_name hamshackbuddy.bot-ai.dev;

       ssl_certificate /etc/letsencrypt/live/hamshackbuddy.bot-ai.dev/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/hamshackbuddy.bot-ai.dev/privkey.pem;
       
       location / {
           proxy_pass http://hamshackbuddy-frontend:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }

       location /api/ {
           proxy_pass http://hamshackbuddy-backend:8001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

9. **Reload Nginx again**

   ```bash
   docker exec nginx-container nginx -s reload
   ```

## Troubleshooting

1. **Check container status**

   ```bash
   docker ps
   ```

2. **Check container logs**

   ```bash
   docker logs hamshackbuddy-backend
   docker logs hamshackbuddy-frontend
   ```

3. **Verify network connectivity**

   ```bash
   docker network inspect nginx-network
   ```

4. **Check for port conflicts**

   ```bash
   netstat -tulpn | grep 8001
   netstat -tulpn | grep 3001
   ```

5. **Test the application endpoints**

   ```bash
   curl -I http://hamshackbuddy.bot-ai.dev
   curl -I http://hamshackbuddy.bot-ai.dev/api/
   ```

## Maintenance

- **Update the application**

  ```bash
  cd /path/to/hamshackbuddy
  git pull  # if using git
  docker-compose down
  docker-compose up -d --build
  ```

- **Backup environment variables**

  ```bash
  cp backend/.env backend/.env.backup
  ```