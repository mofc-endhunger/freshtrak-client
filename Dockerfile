FROM nginx:alpine as production

# Create a simple index.html with "hello world"
RUN echo '<html><body><h1>Hello World</h1></body></html>' > /usr/share/nginx/html/index.html

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]