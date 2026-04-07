# Comparatif taille d’images Docker (optimisé vs anti-pattern)

Ce document sert au **livrable** « comparatif taille image avant / après optimisation ».  
L’image dite « avant » n’est **pas** une ancienne version du dépôt : c’est une **référence volontairement non optimisée** (`Dockerfile.anti-pattern.example`) pour mesurer l’écart avec les **Dockerfiles multi-stage** actuels (`src/*/Dockerfile`).

## Méthode

1. Construire les images **anti-pattern** (tags explicites, hors `docker compose`) :
  ```bash
   docker build -f src/backend/Dockerfile.anti-pattern.example \
     -t backend:anti-pattern \
     ./src/backend

   docker build -f src/frontend/Dockerfile.anti-pattern.example \
     -t frontend:anti-pattern \
     ./src/frontend
  ```
2. Construire les images **réelles** (production) :
  ```bash
   docker build --target production -f src/backend/Dockerfile \
     -t backend:optimise \
     ./src/backend

   docker build --target production -f src/frontend/Dockerfile \
     -t frontend:optimise \
     ./src/frontend
  ```
3. Afficher les tailles :
  ```bash
   docker images backend frontend
  ```
4. **Capture d’écran** : fenêtre terminal avec la sortie de `docker images` filtrée comme ci-dessus, ou tableau recopié dans un rapport / slide.

## Tableau comparatif (tailles locales)

Les valeurs ci-dessous sont **indicatives** (une exécution de build, Docker Desktop). Reproduisez les commandes ci-dessus et mettez à jour si besoin pour votre démo.


| Service  | Anti-pattern (`:anti-pattern`) | Optimisé multi-stage (`:optimise`) | Commentaire                                                                       |
| -------- | ------------------------------ | ---------------------------------- | --------------------------------------------------------------------------------- |
| Backend  | 275 MB                         | 203 MB                             | Prod : `npm install --omit=dev`, user non-root, stages séparés                    |
| Frontend | 341 MB                         | 74 MB                              | Prod : build Node puis image `nginx` unprivileged, sans `node_modules` en runtime |


## Ce que met en place la version optimisée (résumé)

- **Backend** : multi-stage (`base` / `production` / `development`), dépendances prod seules en prod, utilisateur non-root, healthcheck en dev.
- **Frontend** : build Vite dans un stage `builder`, fichiers statiques servis par **nginx** minimal (pas de serveur Node ni de tout le toolchain en production).

## Outils utiles (optionnel)

- [Dive](https://github.com/wagoodman/dive) : analyser couche par couche pourquoi une image est lourde.
- `docker history <image>` : liste des layers et tailles approximatives.

