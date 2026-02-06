FROM node:20-alpine AS base

# Créer utilisateur non-root
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

# Définir répertoire de travail
WORKDIR /app

# on copie le package.json avant de faire npm install
COPY package*.json ./

RUN npm install

COPY . .

CMD ["npm", "run", "dev"]

# Installer dépendances
RUN npm ci --only=production && \
    npm cache clean --force

FROM base AS development


RUN npm ci && \
    npm cache clean --force && \
    rm -rf /tmp/* /var/tmp/*

COPY --chown=appuser:appgroup . .

# Passer à l'utilisateur non-root
USER appuser

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1