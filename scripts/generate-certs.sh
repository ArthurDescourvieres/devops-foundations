ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CERT_DIR="${ROOT}/traefik/certs"
mkdir -p "${CERT_DIR}"
cd "${CERT_DIR}"

MKCERT_BIN="mkcert"
if ! command -v "${MKCERT_BIN}" >/dev/null 2>&1; then
  WINGET_MKCERT="/c/Users/${USERNAME}/AppData/Local/Microsoft/WinGet/Packages/FiloSottile.mkcert_Microsoft.Winget.Source_8wekyb3d8bbwe/mkcert.exe"
  if [ -x "${WINGET_MKCERT}" ]; then
    MKCERT_BIN="${WINGET_MKCERT}"
  else
    echo "mkcert est introuvable. Installe-le puis relance ce script." >&2
    exit 1
  fi
fi

# Force l'installation de la CA locale dans le store systeme + NSS (Firefox/Zen).
# Le script ne doit pas masquer les erreurs: on veut savoir si NSS n'est pas configure.
export TRUST_STORES="${TRUST_STORES:-system,nss}"
if ! "${MKCERT_BIN}" -install; then
  echo "Echec mkcert -install (stores: ${TRUST_STORES})." >&2
  echo "Pour Firefox/Zen, importez manuellement: \$(${MKCERT_BIN} -CAROOT)/rootCA.pem" >&2
  exit 1
fi
# Firefox / Zen (NSS) : le wildcard *.localhost ne couvre souvent PAS app.localhost, api.localhost, etc.
# Il faut lister explicitement chaque nom (voir SSL_ERROR_BAD_CERT_DOMAIN).
"${MKCERT_BIN}" -cert-file local.crt -key-file local.key \
  app.localhost api.localhost db.localhost mail.localhost traefik.localhost \
  "*.localhost" localhost 127.0.0.1 ::1
echo "OK : ${CERT_DIR}/local.crt et local.key"
echo "CA locale mkcert : $("${MKCERT_BIN}" -CAROOT)/rootCA.pem"