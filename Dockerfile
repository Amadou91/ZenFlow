# Stage 1: Build the React application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy the project (including vendored node_modules) to avoid external registry access
COPY . .

# Build the app (creates the /dist folder)
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy the build output from Stage 1 to Nginx's html folder
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80 (internal container port)
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]