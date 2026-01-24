# --- Stage 1: Build Frontend ---
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY package*.json ./
RUN npm ci
COPY . .
# En Easypanel, las variables de entorno se inyectan en tiempo de ejecución
# Pero para el build de Vite necesitamos definirlas si son "baked in".
# Usaremos un placeholder o variables genéricas
ENV VITE_API_URL=/api
RUN npm run build

# --- Stage 2: Build Backend ---
FROM node:20-alpine AS backend-builder
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci
COPY backend/ .
RUN npx tsc

# --- Stage 3: Production Runner ---
FROM node:20-alpine
WORKDIR /app

# Instalar dependencias necesarias para Chrome/Puppeteer (si se require en futuro)
# RUN apk add --no-cache chromium

# Copiar backend construído
COPY --from=backend-builder /app/backend/dist ./dist
COPY --from=backend-builder /app/backend/package*.json ./
COPY --from=backend-builder /app/backend/node_modules ./node_modules

# Copiar frontend construído a la carpeta pública del backend
COPY --from=frontend-builder /app/frontend/dist ./public

# Crear directorio para sesiones de WhatsApp
RUN mkdir -p sessions && chown -R node:node sessions

# Configurar entorno
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "dist/index.js"]
