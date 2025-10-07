FROM nginx:alpine as production

# Create a simple index.html with "hello world"
RUN echo '<!DOCTYPE html><html><head><title>Hello World</title></head><body><h1>Hello World</h1></body></html>' > /usr/share/nginx/html/index.html

# Configure nginx to log to stdout/stderr for CloudWatch
RUN ln -sf /dev/stdout /var/log/nginx/access.log \
    && ln -sf /dev/stderr /var/log/nginx/error.log

# Create custom nginx config for ECS ALB health checks
RUN printf 'server {\n' > /etc/nginx/conf.d/default.conf && \
    printf '    listen 80;\n' >> /etc/nginx/conf.d/default.conf && \
    printf '    server_name _;\n' >> /etc/nginx/conf.d/default.conf && \
    printf '\n' >> /etc/nginx/conf.d/default.conf && \
    printf '    location / {\n' >> /etc/nginx/conf.d/default.conf && \
    printf '        root /usr/share/nginx/html;\n' >> /etc/nginx/conf.d/default.conf && \
    printf '        index index.html;\n' >> /etc/nginx/conf.d/default.conf && \
    printf '    }\n' >> /etc/nginx/conf.d/default.conf && \
    printf '\n' >> /etc/nginx/conf.d/default.conf && \
    printf '    location /health {\n' >> /etc/nginx/conf.d/default.conf && \
    printf '        access_log off;\n' >> /etc/nginx/conf.d/default.conf && \
    printf '        return 200 "OK";\n' >> /etc/nginx/conf.d/default.conf && \
    printf '        add_header Content-Type text/plain;\n' >> /etc/nginx/conf.d/default.conf && \
    printf '    }\n' >> /etc/nginx/conf.d/default.conf && \
    printf '}\n' >> /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]