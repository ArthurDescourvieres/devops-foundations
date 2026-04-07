set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CERT_DIR="${ROOT}/traefik/certs"
mkdir -p "${CERT_DIR}"
cd "${CERT_DIR}"

if ! command -v openssl >/dev/null 2>&1; then
  echo "openssl est introuvable. Installe OpenSSL ou utilise mkcert + scripts/generate-certs.sh." >&2
  exit 1
fi

TMP_CFG="$(mktemp)"
cleanup() { rm -f "${TMP_CFG}"; }
trap cleanup EXIT

cat > "${TMP_CFG}" <<'EOF'
[req]
default_bits = 2048
prompt = no
default_md = sha256
distinguished_name = dn
x509_extensions = v3_req

[dn]
CN = localhost

[v3_req]
subjectAltName = @alt_names
basicConstraints = CA:FALSE
keyUsage = digitalSignature, keyEncipherment
extendedKeyUsage = serverAuth

[alt_names]
DNS.1 = app.localhost
DNS.2 = api.localhost
DNS.3 = db.localhost
DNS.4 = mail.localhost
DNS.5 = traefik.localhost
DNS.6 = *.localhost
DNS.7 = localhost
IP.1 = 127.0.0.1
IP.2 = ::1
EOF

openssl req -x509 -newkey rsa:2048 \
  -keyout local.key -out local.crt \
  -days 825 -nodes \
  -config "${TMP_CFG}"

echo "OK : ${CERT_DIR}/local.crt et local.key (auto-signé OpenSSL)"
