FROM node:20-alpine AS base

RUN addgroup -g 1001 -S backend && \
    adduser -S backend -u 1001 -G backend

WORKDIR /app

COPY package*.json ./

FROM base AS production

RUN npm ci && \
    npm cache clean --force

COPY --chown=backend:backend . .

USER backend

EXPOSE 3000

CMD ["npm", "run", "start"]

FROM base AS development

RUN npm ci && \
    npm cache clean --force && \
    rm -rf /tmp/* /var/tmp/*

COPY --chown=backend:backend . .

USER backend

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --spider -q http://localhost:3000/health || exit 1

CMD ["npm", "run", "dev"]
