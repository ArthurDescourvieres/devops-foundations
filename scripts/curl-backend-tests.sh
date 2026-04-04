#!/usr/bin/env bash

set -euo pipefail

# Script de tests des endpoints backend via Traefik
# Usage :
#   BASE_URL=http://localhost bash scripts/curl-backend-tests.sh
#   (BASE_URL est optionnel, par défaut http://localhost)

BASE_URL="${BASE_URL:-http://localhost}"

echo "=== Test GET / (message de bienvenue) ==="
curl -i "${BASE_URL}/"
echo
echo

echo "=== Test GET /health (statut backend) ==="
curl -i "${BASE_URL}/health"
echo
echo

echo "=== Test GET /db (connexion PostgreSQL) ==="
curl -i "${BASE_URL}/db"
echo
echo

echo "=== Test GET /cache (connexion Redis + compteur) ==="
curl -i "${BASE_URL}/cache"
echo
echo

echo "=== Test POST /contact (envoi email via Mailpit) ==="
curl -i \
  -X POST "${BASE_URL}/contact" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john.doe@example.test",
    "message": "Message de test depuis le script curl"
  }'
echo
echo

echo "Tous les appels curl ont été exécutés."

