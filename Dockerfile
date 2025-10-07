FROM nginx:alpine as production

# Create a simple index.html with "hello world"
RUN echo '<!DOCTYPE html><html><head><title>Hello World</title></head><body><h1>Hello World</h1></body></html>' > /usr/share/nginx/html/index.html

# Configure nginx to log to stdout/stderr for CloudWatch
RUN ln -sf /dev/stdout /var/log/nginx/access.log \
    && ln -sf /dev/stderr /var/log/nginx/error.log

# Create custom nginx config for ECS ALB health checks
RUN echo 'server { \n\
    listen 80; \n\
    server_name _; \n\
    \n\
    location / { \n\
        root /usr/share/nginx/html; \n\
        index index.html; \n\
    } \n\
    \n\
    location /health { \n\
        access_log off; \n\
        return 200 "OK"; \n\
        add_header Content-Type text/plain; \n\
    } \n\
}' > /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]