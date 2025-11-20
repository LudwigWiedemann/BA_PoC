# Basis-Image: Node 22 auf Alpine Linux (klein & schnell)
FROM node:22-alpine

# Arbeitsverzeichnis im Container
WORKDIR /app

# Tools für native Module (z.B. better-sqlite3) installieren
RUN apk add --no-cache python3 make g++

# Nur package-Dateien zuerst kopieren (Cache für npm ci)
COPY package*.json ./

# Dependencies installieren (ohne devDependencies)
RUN npm ci --omit=dev

# Rest vom Backend-Code kopieren
COPY . .

# Port 4000 nach außen "dokumentieren"
EXPOSE 4000

# Startkommando für dein Backend
CMD ["node", "server.js"]