# Build stage
FROM node:20-alpine as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM nginx:stable-alpine as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Nginx 1.19+ automatically runs envsubst on files in /etc/nginx/templates/*.template
# and outputs them to /etc/nginx/conf.d/*.conf before starting.
COPY docker/frontend/nginx.conf /etc/nginx/templates/default.conf.template

# Ensure necessary environment variables are defined or have defaults,
# so envsubst doesn't fail if they are missing in local dev.
ENV PORT=80
ENV BACKEND_URL=http://backend:8080

EXPOSE ${PORT}
# Let the precise built-in Nginx entrypoint handle the template processing
# and start the daemon. Do not override CMD.
