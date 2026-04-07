set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "${ROOT}"

if ! docker info >/dev/null 2>&1; then
  echo "Docker n'est pas disponible (docker info a échoué). Démarre Docker Desktop puis relance ce script." >&2
  exit 1
fi

if [ ! -f "${ROOT}/.env.example" ]; then
  echo "Fichier .env.example introuvable dans ${ROOT}." >&2
  exit 1
fi

if [ ! -f "${ROOT}/.env" ]; then
  cp "${ROOT}/.env.example" "${ROOT}/.env"
  echo "Fichier .env créé depuis .env.example."
  echo "Pense à modifier au minimum POSTGRES_PASSWORD et TRAEFIK_DASHBOARD_PASSWORD."
else
  echo "Fichier .env déjà présent (non écrasé)."
fi

has_mkcert() {
  if command -v mkcert >/dev/null 2>&1; then
    return 0
  fi
  if [ -n "${USERNAME:-}" ]; then
    WINGET_MKCERT="/c/Users/${USERNAME}/AppData/Local/Microsoft/WinGet/Packages/FiloSottile.mkcert_Microsoft.Winget.Source_8wekyb3d8bbwe/mkcert.exe"
    if [ -x "${WINGET_MKCERT}" ]; then
      return 0
    fi
  fi
  return 1
}

if has_mkcert; then
  echo "mkcert détecté : génération des certificats via scripts/generate-certs.sh"
  bash "${ROOT}/scripts/generate-certs.sh"
else
  echo "mkcert absent : certificats auto-signés OpenSSL (avertissement TLS du navigateur possible)."
  bash "${ROOT}/scripts/generate-certs-selfsigned.sh"
  echo "Astuce : installe mkcert puis exécute scripts/generate-certs.sh pour des certificats reconnus localement."
fi

bash "${ROOT}/scripts/generate-dashboard-auth.sh"

echo ""
echo "--- Prochaines étapes ---"
echo "  docker compose up -d --build"
echo ""
echo "URLs (HTTPS via Traefik) :"
echo "  https://app.localhost   https://api.localhost   https://db.localhost"
echo "  https://mail.localhost   https://traefik.localhost"
echo ""
echo "Si les noms *.localhost ne résolvent pas, ajoute-les dans le fichier hosts (voir README)."
