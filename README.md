# DevOps Foundations

Infrastructure de référence conteneurisée : reverse proxy Traefik (HTTPS), API Node.js, dashboard frontend (Vite/React), PostgreSQL, Redis et Mailpit. Tout le trafic HTTP(S) passe par Traefik ; les services applicatifs ne publient pas de ports directs vers l’hôte.

Pour le workflow Git (GitFlow, commits conventionnels), voir [CONTRIBUTING.md](CONTRIBUTING.md).

## Prérequis

- [Docker](https://docs.docker.com/get-docker/) et [Docker Compose](https://docs.docker.com/compose/) (plugin `docker compose` v2)
- [mkcert](https://github.com/FiloSottile/mkcert) pour des certificats TLS locaux reconnus par le navigateur
- Docker utilisé par `scripts/generate-dashboard-auth.sh` pour appeler `htpasswd` (image `httpd`), sans installer Apache sur l’hôte

## Installation pas à pas

1. **Cloner le dépôt**

   ```bash
   git clone https://github.com/prenom-nom/devops-foundations.git
   cd devops-foundations
   ```

2. **Variables d’environnement**

   Copier le fichier d’exemple et l’adapter :

   ```bash
   cp .env.example .env
   ```

   Ne jamais committer `.env`. Renseigner au minimum les mots de passe PostgreSQL, **`TRAEFIK_DASHBOARD_USER`** / **`TRAEFIK_DASHBOARD_PASSWORD`** (et éventuellement **`ADMINER_DASHBOARD_*`** pour des comptes distincts), et les URLs cohérentes avec votre machine.

   `VITE_API_BASE_URL` est utilisé au **build** du frontend (ex. `https://api.localhost`).

3. **Basic Auth (Traefik + Adminer)**

   Générer les fichiers htpasswd **non versionnés** `traefik/auth/traefik-users` et `traefik/auth/adminer-users` **avant** le premier `docker compose up` (sinon Traefik ne peut pas charger les middlewares). Sous **Windows**, exécuter le script depuis **Git Bash**, **WSL** ou un shell compatible (pas besoin d’installer Apache sur l’hôte : le script utilise Docker) :

   ```bash
   chmod +x scripts/generate-dashboard-auth.sh
   ./scripts/generate-dashboard-auth.sh
   ```

   Relancer ce script après tout changement de mot de passe dans `.env`.

4. **Certificats TLS (mkcert)**

   Générer `traefik/certs/local.crt` et `traefik/certs/local.key` (sous Windows : Git Bash, WSL ou équivalent) :

   ```bash
   chmod +x scripts/generate-certs.sh
   ./scripts/generate-certs.sh
   ```

   Les scripts appellent `mkcert` pour les noms explicites (`app.localhost`, `api.localhost`, etc.), `*.localhost`, `localhost` et les IP locales. **Firefox / Zen** : un certificat seulement `*.localhost` peut déclencher `SSL_ERROR_BAD_CERT_DOMAIN` sur `app.localhost` — les noms explicites évitent cela. Après régénération : `docker compose up -d --force-recreate traefik` (ou redémarrage de la stack). Les fichiers sont montés dans Traefik (voir `traefik/dynamic/tls.yml`).

   **404 partout alors que les conteneurs tournent** : utiliser les **vrais noms** (`https://app.localhost`, pas l’IP seule) ; vérifier les logs Traefik ; s’assurer d’avoir exécuté `generate-dashboard-auth` et que `traefik/auth/*-users` existent.

5. **Hosts locaux**

   Les noms `app.localhost`, `api.localhost`, etc. résolvent en général vers `127.0.0.1` sans modification sur les systèmes récents. En cas de doute, ajouter dans `hosts` :

   ```text
   127.0.0.1 app.localhost api.localhost db.localhost mail.localhost traefik.localhost
   ```

6. **Démarrer la stack (développement)**

   Par défaut, Compose charge `docker-compose.yml` et `docker-compose.override.yml` (backend et frontend en mode développement, volumes pour le hot-reload).

   ```bash
   docker compose up -d --build
   ```

## Commandes utiles

| Action | Commande |
|--------|----------|
| Démarrer en arrière-plan | `docker compose up -d` |
| Rebuild des images | `docker compose build` ou `docker compose up -d --build` |
| Rebuild sans cache | `docker compose build --no-cache` |
| Arrêter | `docker compose down` |
| Arrêter et supprimer les volumes nommés | `docker compose down -v` |
| Logs (tous les services) | `docker compose logs -f` |
| Logs d’un service | `docker compose logs -f frontend` |
| État des conteneurs | `docker compose ps` |

**Production** (sans `docker-compose.override.yml`, avec limites et politiques du fichier prod) :

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

Les clés `deploy.replicas` et une partie de `deploy` ne s’appliquent qu’avec Docker Swarm ; en `docker compose` classique, `restart`, `logging` et `healthcheck` restent pris en charge.

## URLs des services (HTTPS)

Trafic uniquement via Traefik (`:80` redirige vers `:443`). Certificats : mkcert.

| Service | URL | Remarque |
|---------|-----|----------|
| Frontend (dashboard) | https://app.localhost | SPA ; en dev, Vite sur le port 5173 derrière Traefik |
| API backend | https://api.localhost | Rate limiting Traefik sur l’API |
| Adminer | https://db.localhost | Basic Auth : comptes définis dans `.env`, fichiers générés par `generate-dashboard-auth` |
| Mailpit (UI) | https://mail.localhost | |
| Dashboard Traefik | https://traefik.localhost | Basic Auth : idem (fichiers `traefik/auth/*-users`) |

## Architecture réseau

Description détaillée des flux, de Traefik et des choix de sécurité : [docs/architecture-reseau.md](docs/architecture-reseau.md).

## Sécurité

- Aucun identifiant ou secret ne doit être versionné : `.env` (ignoré par Git), `.env.example` comme modèle, et **`traefik/auth/traefik-users`** / **`adminer-users`** (ignorés par Git, générés localement).
- Les mots de passe Basic Auth restent dans `.env` ; seuls des **hachages** bcrypt sont écrits dans `traefik/auth/`.
- Les ports des applications ne sont pas exposés sur l’hôte ; seuls 80/443 le sont via Traefik.

## Structure du dépôt (extraits)

```text
devops-foundations/
├── docker-compose.yml
├── docker-compose.override.yml   # dev (hot-reload)
├── docker-compose.prod.yml
├── .env.example
├── traefik/
├── src/
│   ├── frontend/
│   └── backend/
├── docs/
│   ├── architecture-reseau.md
│   └── images/
└── scripts/
```
