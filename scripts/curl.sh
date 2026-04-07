#!/usr/bin/env bash

set -euo pipefail



BASE_URL="${BASE_URL:-https://api.localhost}"

CURL_TLS_OPTS=()
if [[ "$(uname -s 2>/dev/null)" =~ ^(MINGW|MSYS|CYGWIN) ]]; then
  CURL_TLS_OPTS+=(--ssl-no-revoke)
fi

# JSON compact pour affichage / copier-coller (une ligne)
CONTACT_JSON_COMPACT='{"name":"John Doe","email":"john.doe@example.test","message":"Message de test depuis le script curl"}'

# Une ligne shell copiable : toujours "curl" puis les arguments (printf '%q').
# Sans le préfixe "curl", une copie partielle devient une commande invalide (ex. ssl-no-revoke).
curl_line() {
  local arg s=""
  s+=$(printf '%q ' curl)
  for arg in "$@"; do
    s+=$(printf '%q ' "$arg")
  done
  echo "${s% }"
}

# Exécute la même requête que la ligne affichée (sans eval).
curl_exec() {
  curl "$@"
}

run_get_root() {
  echo "=== GET / (message de bienvenue) ==="
  curl_exec "${CURL_TLS_OPTS[@]}" -i "${BASE_URL}/"
  echo
  echo
}

run_get_health() {
  echo "=== GET /health (statut backend) ==="
  curl_exec "${CURL_TLS_OPTS[@]}" -i "${BASE_URL}/health"
  echo
  echo
}

run_get_db() {
  echo "=== GET /db (connexion PostgreSQL) ==="
  curl_exec "${CURL_TLS_OPTS[@]}" -i "${BASE_URL}/db"
  echo
  echo
}

run_get_cache() {
  echo "=== GET /cache (connexion Redis + compteur) ==="
  curl_exec "${CURL_TLS_OPTS[@]}" -i "${BASE_URL}/cache"
  echo
  echo
}

run_post_contact() {
  echo "=== POST /contact (envoi email via Mailpit) ==="
  curl_exec "${CURL_TLS_OPTS[@]}" -i \
    -X POST "${BASE_URL}/contact" \
    -H "Content-Type: application/json" \
    -d "${CONTACT_JSON_COMPACT}"
  echo
  echo
}

run_all() {
  run_get_root
  run_get_health
  run_get_db
  run_get_cache
  run_post_contact
  echo "Tous les appels curl ont été exécutés."
}

# Affiche la ligne curl, puis lit une ligne éditable (si TTY), puis eval (ta saisie).
prompt_and_run_curl() {
  local title="$1"
  local default_line="$2"

  echo "$title"
  echo "--- CURL ---"
  echo "$default_line"
  echo "------------------------------------------------------------------"

  if [[ ! -t 0 ]]; then
    echo "(stdin non interactif : exécution directe.)" >&2
    eval "$default_line"
    echo
    return 0
  fi

  local edited=""
  # read -e -i : bash 4+ ; fallback si indisponible
  if read -e -r -p "> " -i "$default_line" edited 2>/dev/null; then
    :
  else
    echo "Saisis la commande (Entrée vide = ligne par défaut) :" >&2
    read -r edited || return 0
    [[ -z "$edited" ]] && edited="$default_line"
  fi

  eval "$edited"
  echo
}

interactive_run_root() {
  prompt_and_run_curl "GET / — message de bienvenue" \
    "$(curl_line "${CURL_TLS_OPTS[@]}" -i "${BASE_URL}/")"
}

interactive_run_health() {
  prompt_and_run_curl "GET /health — statut backend" \
    "$(curl_line "${CURL_TLS_OPTS[@]}" -i "${BASE_URL}/health")"
}

interactive_run_db() {
  prompt_and_run_curl "GET /db — PostgreSQL" \
    "$(curl_line "${CURL_TLS_OPTS[@]}" -i "${BASE_URL}/db")"
}

interactive_run_cache() {
  prompt_and_run_curl "GET /cache — Redis + compteur" \
    "$(curl_line "${CURL_TLS_OPTS[@]}" -i "${BASE_URL}/cache")"
}

interactive_run_contact() {
  prompt_and_run_curl "POST /contact — Mailpit" \
    "$(curl_line "${CURL_TLS_OPTS[@]}" -i -X POST "${BASE_URL}/contact" -H "Content-Type: application/json" -d "${CONTACT_JSON_COMPACT}")"
}

interactive_run_all() {
  echo "=== Aperçu des 5 commandes ==="
  echo
  echo "# 1"
  curl_line "${CURL_TLS_OPTS[@]}" -i "${BASE_URL}/"
  echo
  echo "# 2"
  curl_line "${CURL_TLS_OPTS[@]}" -i "${BASE_URL}/health"
  echo
  echo "# 3"
  curl_line "${CURL_TLS_OPTS[@]}" -i "${BASE_URL}/db"
  echo
  echo "# 4"
  curl_line "${CURL_TLS_OPTS[@]}" -i "${BASE_URL}/cache"
  echo
  echo "# 5"
  curl_line "${CURL_TLS_OPTS[@]}" -i -X POST "${BASE_URL}/contact" -H "Content-Type: application/json" -d "${CONTACT_JSON_COMPACT}"
  echo
  read -r -p "Exécuter ces 5 requêtes à la suite ? [o/N] " ans || true
  if [[ "${ans:-}" =~ ^[oOyY] ]]; then
    run_all
  else
    echo "Annulé — tu peux copier les lignes ci-dessus dans ton terminal."
  fi
}

# Mode interactif : affiche la commande + édition avant exécution
dispatch_interactive() {
  local key="${1:-}"
  case "$key" in
    1 | / | root | accueil) interactive_run_root ;;
    2 | health) interactive_run_health ;;
    3 | db | postgres) interactive_run_db ;;
    4 | cache | redis) interactive_run_cache ;;
    5 | contact | mail) interactive_run_contact ;;
    6 | all | tout) interactive_run_all ;;
    *)
      echo "Route inconnue : $key" >&2
      return 1
      ;;
  esac
}

dispatch_route() {
  local key="${1:-}"
  case "$key" in
    1 | / | root | accueil) run_get_root ;;
    2 | health) run_get_health ;;
    3 | db | postgres) run_get_db ;;
    4 | cache | redis) run_get_cache ;;
    5 | contact | mail) run_post_contact ;;
    6 | all | tout) run_all ;;
    *)
      echo "Route inconnue : $key" >&2
      return 1
      ;;
  esac
}

show_help() {
  cat <<EOF
Tests curl backend (BASE_URL=${BASE_URL})

  Interactif : lancez sans argument. La commande curl s’affiche ; modifiez-la
  puis Entrée pour l’exécuter (readline).

  Options :
    --all, -a     Exécuter toutes les routes puis quitter (sans menu)
    --help, -h    Cette aide

  Arguments (un ou plusieurs, sans aperçu interactif) :
    1 2 3 4 5     Numéros du menu
    / health db cache contact   Noms ou chemins courts
EOF
}

show_menu() {
  cat <<EOF

  Base URL : ${BASE_URL}

  1) GET  /           — message de bienvenue
  2) GET  /health     — statut backend
  3) GET  /db         — PostgreSQL
  4) GET  /cache      — Redis + compteur
  5) POST /contact    — Mailpit
  6) Toutes les routes (aperçu des 5 commandes puis option d’enchaîner)
  0) Quitter

EOF
}

interactive_loop() {
  local choice
  while true; do
    show_menu
    read -r -p "Votre choix (0-6) : " choice || exit 0
    case "$choice" in
      0 | q | Q | quit | exit)
        echo "Au revoir."
        exit 0
        ;;
      '')
        echo "Choix vide — entrez un numéro entre 0 et 6."
        ;;
      *)
        if ! dispatch_interactive "$choice"; then
          echo "Utilisez 1 à 6, ou 0 pour quitter."
        fi
        ;;
    esac
  done
}

main() {
  if [[ "${1:-}" == --help ]] || [[ "${1:-}" == -h ]]; then
    show_help
    exit 0
  fi

  if [[ "${1:-}" == --all ]] || [[ "${1:-}" == -a ]]; then
    run_all
    exit 0
  fi

  if [[ $# -gt 0 ]]; then
    local a
    for a in "$@"; do
      dispatch_route "$a" || exit 1
    done
    exit 0
  fi

  interactive_loop
}

main "$@"
