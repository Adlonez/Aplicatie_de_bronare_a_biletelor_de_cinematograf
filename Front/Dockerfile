FROM node:22-alpine AS build
WORKDIR /app

# Copy package files
COPY Front/package.json Front/package-lock.json* ./

# Install dependencies cleanly
RUN npm ci || npm install

# Copy source code and build
COPY Front/ .
RUN npm run build

# Nginx runtime stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

# Replace default Nginx config with our own
COPY Front/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]