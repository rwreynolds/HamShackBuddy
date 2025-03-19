server {
    listen 80;
    server_name oaai.bot-ai.dev;

    location / {
        proxy_pass http://new_frontend:3001;
    }

    location /api/ {
        proxy_pass http://new_backend:8001;
    }
}
