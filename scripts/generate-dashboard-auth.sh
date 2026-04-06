#!/usr/bin/env sh
# Génère traefik/auth/traefik-users et adminer-users (htpasswd bcrypt) à partir du .env.
# Prérequis : Docker (image httpd utilisée pour htpasswd).
set -eu
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="${ROOT}/.env"
OUT_DIR="${ROOT}/traefik/auth"

if [ ! -f "${ENV_FILE}" ]; then
  echo "Fichier ${ENV_FILE} introuvable. Copiez .env.example vers .env et renseignez TRAEFIK_DASHBOARD_*." >&2
  exit 1
fi

# Charge .env (format simple KEY=VAL, sans export requis)
set -a
# shellcheck disable=SC1090
. "${ENV_FILE}"
set +a

: "${TRAEFIK_DASHBOARD_USER:?Définir TRAEFIK_DASHBOARD_USER dans .env}"
: "${TRAEFIK_DASHBOARD_PASSWORD:?Définir TRAEFIK_DASHBOARD_PASSWORD dans .env}"

ADMINER_USER="${ADMINER_DASHBOARD_USER:-$TRAEFIK_DASHBOARD_USER}"
ADMINER_PASS="${ADMINER_DASHBOARD_PASSWORD:-$TRAEFIK_DASHBOARD_PASSWORD}"

mkdir -p "${OUT_DIR}"

docker run --rm httpd:2.4-alpine htpasswd -nbB "${TRAEFIK_DASHBOARD_USER}" "${TRAEFIK_DASHBOARD_PASSWORD}" \
  | tr -d '\r' > "${OUT_DIR}/traefik-users"

docker run --rm httpd:2.4-alpine htpasswd -nbB "${ADMINER_USER}" "${ADMINER_PASS}" \
  | tr -d '\r' > "${OUT_DIR}/adminer-users"

echo "OK : ${OUT_DIR}/traefik-users et adminer-users (ne pas committer)."
