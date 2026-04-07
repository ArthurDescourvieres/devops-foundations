#!/usr/bin/env bash
set -euo pipefail

# ============================================================
#  demo-swarm-stop.sh – Nettoyage complet du déploiement Swarm
# ============================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
RESET='\033[0m'

info()    { echo -e "${CYAN}[INFO]${RESET}  $*"; }
success() { echo -e "${GREEN}[OK]${RESET}    $*"; }
warn()    { echo -e "${YELLOW}[WARN]${RESET}  $*"; }

echo -e "\n${BOLD}=== Arrêt du déploiement Swarm – DevOps Foundations ===${RESET}\n"

# ── Suppression de la stack ──────────────────────────────────
if docker stack ls --format "{{.Name}}" 2>/dev/null | grep -q "^devops$"; then
  info "Suppression de la stack 'devops'..."
  docker stack rm devops
  success "Stack 'devops' supprimée."

  info "Attente de la suppression des conteneurs..."
  MAX_WAIT=60
  ELAPSED=0
  INTERVAL=3

  while docker ps -a --filter "name=devops_" --format "{{.Names}}" 2>/dev/null | grep -q "devops_"; do
    if [[ ${ELAPSED} -ge ${MAX_WAIT} ]]; then
      warn "Délai dépassé, certains conteneurs sont peut-être encore présents."
      break
    fi
    echo -ne "\r  Nettoyage en cours... (${ELAPSED}s)"
    sleep ${INTERVAL}
    ELAPSED=$((ELAPSED + INTERVAL))
  done
  echo
  success "Conteneurs supprimés."
else
  warn "Aucune stack 'devops' trouvée, rien à supprimer."
fi

# ── Quitter le Swarm ─────────────────────────────────────────
# Ne pas utiliser grep "active" : "inactive" contient la sous-chaîne "active".
SWARM_STATE="$(docker info --format '{{.Swarm.LocalNodeState}}' 2>/dev/null || echo inactive)"

if [[ "${SWARM_STATE}" == "active" ]]; then
  info "Quitter le Swarm..."
  docker swarm leave --force
  success "Nœud retiré du Swarm."
else
  warn "Docker Swarm n'est pas actif (état: ${SWARM_STATE}), rien à faire."
fi

# ── Message final ─────────────────────────────────────────────
echo -e "\n${BOLD}${GREEN}=== Environnement remis à zéro ===${RESET}"
echo -e ""
echo -e "  Prêt pour le mode dev :"
echo -e "  ${YELLOW}docker compose up -d${RESET}"
echo -e ""
