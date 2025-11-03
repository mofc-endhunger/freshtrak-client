#!/bin/sh

echo "Generating runtime configuration from environment variables..."

# Start building the runtime config
echo "window._env_ = {" > /usr/share/nginx/html/runtime-config.js

# Loop through all REACT_APP_* environment variables and export them
env | grep '^REACT_APP_' | while IFS='=' read -r name value; do
  # Remove REACT_APP_ prefix for cleaner keys
  key=$(echo "$name" | sed 's/^REACT_APP_//')
  # Escape quotes in value and append to config
  escaped_value=$(echo "$value" | sed 's/"/\\"/g')
  echo "  $key: \"$escaped_value\"," >> /usr/share/nginx/html/runtime-config.js
done

# Close the object
echo "};" >> /usr/share/nginx/html/runtime-config.js

echo "Runtime configuration generated successfully:"
cat /usr/share/nginx/html/runtime-config.js

# Replace Google Maps API key placeholder in index.html
# This is needed because the script tag in HTML needs the key at load time
if [ -n "$REACT_APP_GOOGLE_GEOLOCATION_KEY" ]; then
  echo "Injecting Google Maps API key into index.html..."
  sed -i "s|%REACT_APP_GOOGLE_GEOLOCATION_KEY%|${REACT_APP_GOOGLE_GEOLOCATION_KEY}|g" /usr/share/nginx/html/index.html
fi

# Start nginx
exec nginx -g 'daemon off;'
