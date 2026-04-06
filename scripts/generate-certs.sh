ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CERT_DIR="${ROOT}/traefik/certs"
mkdir -p "${CERT_DIR}"
cd "${CERT_DIR}"

if ! command -v mkcert >/dev/null 2>&1; then
  echo "mkcert est introuvable. Installe-le puis relance ce script." >&2
  exit 1
fi

mkcert -install >/dev/null 2>&1 || true
# Firefox / Zen (NSS) : le wildcard *.localhost ne couvre souvent PAS app.localhost, api.localhost, etc.
# Il faut lister explicitement chaque nom (voir SSL_ERROR_BAD_CERT_DOMAIN).
mkcert -cert-file local.crt -key-file local.key \
  app.localhost api.localhost db.localhost mail.localhost traefik.localhost \
  "*.localhost" localhost 127.0.0.1 ::1
echo "OK : ${CERT_DIR}/local.crt et local.key"