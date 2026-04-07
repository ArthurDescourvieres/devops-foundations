#!/usr/bin/env bash
set -euo pipefail

# ============================================================
#  demo-swarm.sh – Build des images + déploiement Docker Swarm
# ============================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
RESET='\033[0m'

info()    { echo -e "${CYAN}[INFO]${RESET}  $*"; }
success() { echo -e "${GREEN}[OK]${RESET}    $*"; }
warn()    { echo -e "${YELLOW}[WARN]${RESET}  $*"; }
error()   { echo -e "${RED}[ERROR]${RESET} $*" >&2; }

# ── Prérequis ────────────────────────────────────────────────
echo -e "\n${BOLD}=== Demo Docker Swarm – DevOps Foundations ===${RESET}\n"

if ! docker info &>/dev/null; then
  error "Docker n'est pas accessible. Vérifiez que le daemon tourne."
  exit 1
fi

if [[ ! -f "${ROOT_DIR}/.env" ]]; then
  error "Fichier .env introuvable. Lancez d'abord : bash scripts/init.sh"
  exit 1
fi

cd "${ROOT_DIR}"

# ── Build des images production ──────────────────────────────
info "Build de l'image backend (target: production)..."
docker build \
  -t devops-backend:latest \
  --target production \
  ./src/backend
success "Image devops-backend:latest construite."

info "Build de l'image frontend (target: production)..."
# Charger VITE_API_BASE_URL depuis .env si disponible
VITE_API_BASE_URL="${VITE_API_BASE_URL:-https://api.localhost}"
if grep -q "^VITE_API_BASE_URL=" .env 2>/dev/null; then
  VITE_API_BASE_URL="$(grep '^VITE_API_BASE_URL=' .env | cut -d'=' -f2-)"
fi

docker build \
  -t devops-frontend:latest \
  --target production \
  --build-arg "VITE_API_BASE_URL=${VITE_API_BASE_URL}" \
  ./src/frontend
success "Image devops-frontend:latest construite."

# ── Docker Swarm init ────────────────────────────────────────
SWARM_STATE="$(docker info --format '{{.Swarm.LocalNodeState}}' 2>/dev/null || echo inactive)"
SWARM_MANAGER="$(docker info --format '{{.Swarm.ControlAvailable}}' 2>/dev/null || echo false)"

if [[ "${SWARM_MANAGER}" == "true" ]]; then
  success "Ce nœud est déjà un manager Swarm, on continue."
elif [[ "${SWARM_STATE}" == "active" ]]; then
  warn "Nœud dans un swarm mais pas manager (ex. worker). Sortie puis réinit en manager local..."
  docker swarm leave 2>/dev/null || docker swarm leave --force || true
  info "Initialisation du Swarm..."
  docker swarm init
  success "Swarm initialisé."
else
  info "Initialisation du Swarm..."
  docker swarm init
  success "Swarm initialisé."
fi

# ── Stack deploy ─────────────────────────────────────────────
info "Déploiement de la stack 'devops'..."
docker stack deploy -c docker-stack.yml devops
success "Stack déployée (les services convergent en arrière-plan, voir la boucle ci-dessous)."

# ── Attente que les services soient running ──────────────────
info "Attente du démarrage des services (max 120s)..."
MAX_WAIT=120
ELAPSED=0
INTERVAL=5

while true; do
  TOTAL=$(docker service ls --filter "name=devops_" --format "{{.Replicas}}" 2>/dev/null \
    | awk -F'/' '{total+=$1; wanted+=$2} END {print total"/"wanted}')
  RUNNING=$(echo "${TOTAL}" | cut -d'/' -f1)
  WANTED=$(echo "${TOTAL}" | cut -d'/' -f2)

  if [[ -n "${WANTED}" && "${WANTED}" -gt 0 && "${RUNNING}" -eq "${WANTED}" ]]; then
    success "Tous les services sont up (${RUNNING}/${WANTED} replicas)."
    break
  fi

  if [[ ${ELAPSED} -ge ${MAX_WAIT} ]]; then
    warn "Délai dépassé. Certains services ne sont peut-être pas encore prêts."
    break
  fi

  echo -ne "\r  En attente : ${RUNNING:-0}/${WANTED:-?} replicas up... (${ELAPSED}s)"
  sleep ${INTERVAL}
  ELAPSED=$((ELAPSED + INTERVAL))
done
echo

# ── Status ───────────────────────────────────────────────────
echo -e "\n${BOLD}--- docker service ls ---${RESET}"
docker service ls

echo -e "\n${BOLD}--- Replicas backend ---${RESET}"
docker service ps devops_backend --no-trunc

# ── Résumé ───────────────────────────────────────────────────
echo -e "\n${BOLD}${GREEN}=== Déploiement terminé ===${RESET}"
echo -e ""
echo -e "  ${BOLD}URLs de la démo :${RESET}"
echo -e "  • Frontend  → ${CYAN}https://app.localhost${RESET}"
echo -e "  • Backend   → ${CYAN}https://api.localhost${RESET}"
echo -e "  • Traefik   → ${CYAN}https://traefik.localhost${RESET}"
echo -e "  • Adminer   → ${CYAN}https://db.localhost${RESET}"
echo -e "  • Mailpit   → ${CYAN}https://mail.localhost${RESET}"
echo -e ""
echo -e "  ${BOLD}Test du load balancing (2 replicas backend) :${RESET}"
echo -e "  ${YELLOW}for i in \$(seq 1 6); do curl -sk https://api.localhost/health | python3 -m json.tool; done${RESET}"
echo -e ""
echo -e "  ${BOLD}Arrêt :${RESET}"
echo -e "  ${YELLOW}bash scripts/demo-swarm-stop.sh${RESET}"
echo -e ""
