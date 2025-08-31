### Multi-stage Dockerfile for building and serving the Vite React app
### Stage 1: build the app
FROM node:18-alpine AS build
WORKDIR /app

# Install dependencies (use package.json + lockfile if present)
COPY package.json package-lock.json* ./
COPY bun.lockb* ./
RUN npm ci --silent

# Copy source
COPY . .

# Build-time environment variables for Vite (these are embedded into the client bundle)
# Pass them with `--build-arg NAME=value` when running `docker build`.
ARG VITE_FIREBASE_API_KEY="AIzaSyDrNM4bWhdh_7sNQ65o4notdD6w7NMDSdU"
ARG VITE_FIREBASE_AUTH_DOMAIN="sample-firebase-ai-app-948ed.firebaseapp.com"
ARG VITE_FIREBASE_PROJECT_ID="sample-firebase-ai-app-948ed"
ARG VITE_FIREBASE_STORAGE_BUCKET="sample-firebase-ai-app-948ed.firebasestorage.app"
ARG VITE_FIREBASE_MESSAGING_SENDER_ID="342192194469"
ARG VITE_FIREBASE_APP_ID="1:342192194469:web:7a70635d08efa15767de4c"
ARG VITE_FIREBASE_MEASUREMENT_ID="G-LCYQW6EZY2"
ARG RECAPTCHA_SITE_KEY="6Lcuu7QrAAAAAJMTVBQEvwbC9THpuOh6hSKGX73p"

# Export ARGs as ENV so the build process sees them in process.env
ENV VITE_FIREBASE_API_KEY=${VITE_FIREBASE_API_KEY}
ENV VITE_FIREBASE_AUTH_DOMAIN=${VITE_FIREBASE_AUTH_DOMAIN}
ENV VITE_FIREBASE_PROJECT_ID=${VITE_FIREBASE_PROJECT_ID}
ENV VITE_FIREBASE_STORAGE_BUCKET=${VITE_FIREBASE_STORAGE_BUCKET}
ENV VITE_FIREBASE_MESSAGING_SENDER_ID=${VITE_FIREBASE_MESSAGING_SENDER_ID}
ENV VITE_FIREBASE_APP_ID=${VITE_FIREBASE_APP_ID}
ENV VITE_FIREBASE_MEASUREMENT_ID=${VITE_FIREBASE_MEASUREMENT_ID}
ENV RECAPTCHA_SITE_KEY=${RECAPTCHA_SITE_KEY}

# Write a .env.production file so Vite (production mode) loads these vars
RUN printf "VITE_FIREBASE_API_KEY=%s\nVITE_FIREBASE_AUTH_DOMAIN=%s\nVITE_FIREBASE_PROJECT_ID=%s\nVITE_FIREBASE_STORAGE_BUCKET=%s\nVITE_FIREBASE_MESSAGING_SENDER_ID=%s\nVITE_FIREBASE_APP_ID=%s\nVITE_FIREBASE_MEASUREMENT_ID=%s\nRECAPTCHA_SITE_KEY=%s\n" \
	"$VITE_FIREBASE_API_KEY" "$VITE_FIREBASE_AUTH_DOMAIN" "$VITE_FIREBASE_PROJECT_ID" "$VITE_FIREBASE_STORAGE_BUCKET" "$VITE_FIREBASE_MESSAGING_SENDER_ID" "$VITE_FIREBASE_APP_ID" "$VITE_FIREBASE_MEASUREMENT_ID" "$RECAPTCHA_SITE_KEY" > .env.production

# Build
RUN npm run build

# Create a small runtime env JS file in the build output so the deployed app can read runtime config
# This avoids relying solely on build-time replacement and allows the container to inject values.
RUN printf "window.__APP_ENV__ = {\n  \"VITE_FIREBASE_API_KEY\": \"%s\",\n  \"VITE_FIREBASE_AUTH_DOMAIN\": \"%s\",\n  \"VITE_FIREBASE_PROJECT_ID\": \"%s\",\n  \"VITE_FIREBASE_STORAGE_BUCKET\": \"%s\",\n  \"VITE_FIREBASE_MESSAGING_SENDER_ID\": \"%s\",\n  \"VITE_FIREBASE_APP_ID\": \"%s\",\n  \"VITE_FIREBASE_MEASUREMENT_ID\": \"%s\",\n  \"RECAPTCHA_SITE_KEY\": \"%s\"\n};\n" \
	"$VITE_FIREBASE_API_KEY" "$VITE_FIREBASE_AUTH_DOMAIN" "$VITE_FIREBASE_PROJECT_ID" "$VITE_FIREBASE_STORAGE_BUCKET" "$VITE_FIREBASE_MESSAGING_SENDER_ID" "$VITE_FIREBASE_APP_ID" "$VITE_FIREBASE_MEASUREMENT_ID" "$RECAPTCHA_SITE_KEY" > dist/env.js

# Inject env.js into the built index.html so it's loaded before the main bundle
RUN sed -i 's|<head>|<head>\n  <script src="/env.js"></script>|' dist/index.html

### Stage 2: serve with nginx
FROM nginx:stable-alpine AS runtime
RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
