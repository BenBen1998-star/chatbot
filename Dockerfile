# Stage 1: Build dashboard
FROM node:20-alpine AS dashboard-build
WORKDIR /app/dashboard
COPY dashboard/package*.json ./
RUN npm ci
COPY dashboard/ ./
RUN npm run build

# Stage 2: Build frontend widget
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 3: Production backend
FROM node:20-alpine AS production
WORKDIR /app

# Copy backend dependencies
COPY backend/package*.json ./
RUN npm ci

# Copy backend source
COPY backend/ ./

# Copy built dashboard and frontend into public/
COPY --from=dashboard-build /app/dashboard/dist ./public/dashboard
COPY --from=frontend-build /app/frontend/dist ./public/widget

EXPOSE 3001

CMD ["npx", "tsx", "src/index.ts"]
