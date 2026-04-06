FROM node:20.18-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY index.html tsconfig.json vite.config.ts ./
COPY src ./src

ARG VITE_API_BASE_URL=https://api.localhost
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

RUN npm run build

# L’image nginx unprivileged utilise l’utilisateur système `nginx` (UID 101), pas 1001 comme le backend,
# pour rester compatible avec les permissions cache/pid fournies par l’image.
FROM nginxinc/nginx-unprivileged:1.27-alpine AS production

ARG BUILD_VERSION=0.1.0

LABEL org.opencontainers.image.title="DevOps Foundations Frontend" \
    org.opencontainers.image.description="Dashboard React (Vite) DevOps Foundations" \
    org.opencontainers.image.source="https://github.com/prenom-nom/devops-foundations" \
    org.opencontainers.image.version="${BUILD_VERSION}"

COPY --from=builder --chown=nginx:nginx /app/dist/ /usr/share/nginx/html/
COPY --chown=nginx:nginx nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD wget -qO- http://127.0.0.1:8080/ > /dev/null || exit 1
