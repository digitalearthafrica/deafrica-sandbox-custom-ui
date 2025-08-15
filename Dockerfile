# Build the React app
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Serve with Nginx
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
# App bundle
COPY --from=builder /app/build /usr/share/nginx/html
# Config directory (mounted via ConfigMap at runtime)
RUN mkdir -p /usr/share/nginx/html/config
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
