# Guide de Contribution - DevOps Foundations

Ce document décrit le workflow Git, les conventions de commits et le processus de contribution pour ce projet.

## Table des matières

- [Stratégie de Branching (GitFlow)](#stratégie-de-branching-gitflow)
- [Conventions de Commits](#conventions-de-commits)
- [Processus de Code Review](#processus-de-code-review)
- [Checklist de Self-Review](#checklist-de-self-review)

---

## Stratégie de Branching (GitFlow)

Ce projet utilise **GitFlow** comme stratégie de gestion des branches. Cette approche permet une organisation claire du développement et facilite la collaboration.

### Branches principales

#### `main`
- **Rôle** : Branche de production, toujours stable et déployable
- **Protection** : Branche protégée, aucune modification directe
- **Intégration** : Uniquement via merge depuis `develop` ou `hotfix/*`
- **Tags** : Chaque release est taguée (ex: `v1.0.0`)

#### `develop`
- **Rôle** : Branche d'intégration pour le développement
- **Protection** : Branche protégée, aucune modification directe
- **Intégration** : Uniquement via merge depuis `feature/*` ou `release/*`
- **État** : Toujours prête pour la prochaine release

### Branches de support

#### `feature/*`
- **Format** : `feature/nom-descriptif` (ex: `feature/add-redis-cache`)
- **Création** : À partir de `develop`
- **Objectif** : Développer une nouvelle fonctionnalité
- **Merge** : Retour vers `develop` via Pull Request
- **Durée** : Temporaire, supprimée après merge
- **Commits** : Minimum 5 commits atomiques par feature

#### `release/*`
- **Format** : `release/version` (ex: `release/1.0.0`)
- **Création** : À partir de `develop` quand `develop` est prête pour release
- **Objectif** : Préparer une nouvelle release (versioning, docs, tests finaux)
- **Merge** : Vers `main` (tag) et retour vers `develop`
- **Durée** : Temporaire, supprimée après merge

#### `hotfix/*`
- **Format** : `hotfix/description` (ex: `hotfix/fix-security-vulnerability`)
- **Création** : À partir de `main` (en cas d'urgence)
- **Objectif** : Corriger un bug critique en production
- **Merge** : Vers `main` (tag) et retour vers `develop`
- **Durée** : Temporaire, supprimée après merge

### Workflow visuel

```
main          ●────────●────────●────────● (tags: v1.0.0, v1.1.0)
               \      /        \      /
                \    /          \    /
develop          ●──●──────────●──●
                  \  \        /  /
                   \  \      /  /
feature/*           ●──●    ●──●
```

### Commandes GitFlow

#### Créer une feature
```bash
# Basculer sur develop
git checkout develop
git pull origin develop

# Créer la branche feature
git checkout -b feature/nom-de-la-feature

# Développer et commiter
git add .
git commit -m "feat: description du changement"

# Pousser la branche
git push -u origin feature/nom-de-la-feature
```

#### Finaliser une feature
```bash
# S'assurer que develop est à jour
git checkout develop
git pull origin develop

# Merger la feature dans develop
git merge --no-ff feature/nom-de-la-feature

# Supprimer la branche locale
git branch -d feature/nom-de-la-feature

# Supprimer la branche distante
git push origin --delete feature/nom-de-la-feature
```

#### Créer une release
```bash
git checkout develop
git checkout -b release/1.0.0

# Préparer la release (version, changelog, etc.)
# ...

# Merger dans main et tagger
git checkout main
git merge --no-ff release/1.0.0
git tag -a v1.0.0 -m "Release version 1.0.0"

# Merger dans develop
git checkout develop
git merge --no-ff release/1.0.0
```

#### Créer un hotfix
```bash
git checkout main
git checkout -b hotfix/fix-description

# Corriger le bug
# ...

# Merger dans main et tagger
git checkout main
git merge --no-ff hotfix/fix-description
git tag -a v1.0.1 -m "Hotfix version 1.0.1"

# Merger dans develop
git checkout develop
git merge --no-ff hotfix/fix-description
```

---

## Conventions de Commits

Ce projet suit les **Conventional Commits** pour garantir un historique Git clair et exploitable.

### Format général

```
<type>(<scope>): <description courte>

[corps optionnel]

[footer optionnel]
```

### Types de commits

| Type | Description | Exemple |
|------|-------------|---------|
| `feat` | Nouvelle fonctionnalité | `feat(backend): add Redis cache endpoint` |
| `fix` | Correction de bug | `fix(frontend): resolve dashboard loading issue` |
| `docs` | Documentation uniquement | `docs: update README with installation steps` |
| `style` | Formatage, point-virgule manquant, etc. | `style(backend): format code with prettier` |
| `refactor` | Refactorisation du code | `refactor(docker): optimize multi-stage builds` |
| `perf` | Amélioration de performance | `perf(backend): optimize database queries` |
| `test` | Ajout/modification de tests | `test(backend): add unit tests for health endpoint` |
| `chore` | Tâches de maintenance | `chore: update dependencies` |
| `ci` | Configuration CI/CD | `ci: add GitHub Actions workflow` |
| `build` | Système de build | `build(docker): update Dockerfile base image` |

### Scope (optionnel)

Le scope indique la partie du projet affectée :
- `backend` : Service backend
- `frontend` : Service frontend
- `docker` : Configuration Docker
- `traefik` : Configuration Traefik
- `docs` : Documentation

### Description

- **Impératif présent** : "add" pas "added" ou "adds"
- **Première lettre minuscule** : "add" pas "Add"
- **Pas de point final** : "add Redis cache" pas "add Redis cache."
- **Maximum 72 caractères**

### Exemples de commits

```bash
# Bon
feat(backend): add PostgreSQL health check endpoint
fix(frontend): resolve dashboard service status display
docs: update CONTRIBUTING with merge workflow
chore(docker): update Node.js base image to 20-alpine

# Mauvais
feat: Added new endpoint  # Pas de scope, "Added" au lieu de "add"
fix bug in dashboard  # Pas de type, pas de format
Update README  # Pas de type
```

### Corps du commit (optionnel)

Pour les commits complexes, ajouter un corps détaillant :
- **Pourquoi** le changement est nécessaire
- **Comment** il résout le problème
- **Impact** sur le reste du code

```bash
feat(backend): add Redis cache endpoint

Implement GET /cache endpoint that:
- Tests Redis connection
- Increments visit counter
- Returns counter value and connection status

This endpoint allows the frontend to display
the visit counter and verify cache availability.
```

### Footer (optionnel)

Pour référencer des issues ou breaking changes :

```bash
feat(api): change authentication method

BREAKING CHANGE: JWT tokens now expire after 1 hour
instead of 24 hours. Clients must refresh tokens
more frequently.

Closes #123
```

---

## Processus de Code Review

### Avant de créer une Pull Request

1. **Vérifier que votre branche est à jour**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout feature/votre-feature
   git rebase develop  # ou merge selon la politique
   ```

2. **Exécuter la checklist de self-review** (voir section suivante)

3. **Tester localement**
   - Vérifier que les services démarrent correctement
   - Tester les fonctionnalités ajoutées/modifiées
   - Vérifier qu'il n'y a pas de régressions

4. **Pousser votre branche**
   ```bash
   git push origin feature/votre-feature
   ```

### Créer la Pull Request

1. **Titre clair et descriptif**
   - Format : `[Type] Description courte`
   - Exemple : `[Feature] Add Redis cache endpoint to backend`

2. **Description détaillée**
   - **Contexte** : Pourquoi ce changement est nécessaire
   - **Changements** : Ce qui a été modifié/ajouté
   - **Tests** : Comment tester les changements
   - **Checklist** : Cocher les éléments de la checklist

3. **Référencer les issues** (si applicable)
   - `Closes #123` ou `Fixes #123`

### Pendant la review

- **Répondre aux commentaires** de manière constructive
- **Faire les modifications** demandées
- **Pousser les corrections** sur la même branche
- **Marquer les conversations** comme résolues

### Après approbation

- **Merger la PR** (via l'interface GitHub/GitLab)
- **Supprimer la branche** distante après merge
- **Mettre à jour localement**
   ```bash
   git checkout develop
   git pull origin develop
   git branch -d feature/votre-feature
   ```

---

## Checklist de Self-Review

Avant de créer une Pull Request, vérifier chaque point :

### Code

- [ ] Le code respecte les conventions du projet
- [ ] Les fonctions/méthodes sont documentées si nécessaire
- [ ] Aucun code commenté ou inutile
- [ ] Pas de secrets ou credentials en clair
- [ ] Les variables d'environnement sont documentées dans `.env.example`

### Tests

- [ ] Les fonctionnalités ajoutées sont testables
- [ ] Les endpoints retournent les bonnes réponses
- [ ] Les erreurs sont gérées correctement
- [ ] Pas de régressions introduites

### Docker

- [ ] Les Dockerfiles utilisent des multi-stage builds
- [ ] Les images sont optimisées (taille minimale)
- [ ] Les health checks sont configurés
- [ ] Aucun port n'est exposé directement (sauf Traefik)
- [ ] Les `.dockerignore` sont complets

### Docker Compose

- [ ] Les services ont des health checks appropriés
- [ ] Les réseaux sont correctement isolés
- [ ] Les volumes sont nommés pour la persistance
- [ ] Les variables d'environnement sont dans `.env.example`
- [ ] Les secrets ne sont pas en clair

### Traefik

- [ ] Les labels Docker sont correctement configurés
- [ ] Les middlewares sont appliqués (sécurité, rate limiting)
- [ ] Les routes sont accessibles via les domaines configurés
- [ ] Le Basic Auth est configuré pour les interfaces sensibles

### Documentation

- [ ] Le README est à jour si nécessaire
- [ ] Les nouvelles fonctionnalités sont documentées
- [ ] Les choix techniques sont justifiés

### Git

- [ ] Les commits suivent les Conventional Commits
- [ ] Minimum 5 commits atomiques par feature
- [ ] Les messages de commit sont clairs et descriptifs
- [ ] La branche est à jour avec `develop`

### Sécurité

- [ ] Aucun secret dans le code versionné
- [ ] Les dépendances sont à jour (pas de vulnérabilités connues)
- [ ] Les middlewares de sécurité Traefik sont actifs
- [ ] Les services utilisent des utilisateurs non-root

---

## Résolution de conflits

### Pendant un merge

Si des conflits apparaissent lors du merge :

1. **Identifier les fichiers en conflit**
   ```bash
   git status
   ```

2. **Ouvrir les fichiers** et résoudre les conflits manuellement
   - Chercher les marqueurs `<<<<<<<`, `=======`, `>>>>>>>`
   - Choisir la version appropriée ou combiner les deux

3. **Marquer comme résolu**
   ```bash
   git add fichier-resolu.md
   ```

4. **Finaliser le merge**
   ```bash
   git commit -m "docs: resolve merge conflicts in CONTRIBUTING.md"
   ```

### Documentation des conflits

Pour les conflits importants, documenter la résolution dans le message de commit :

```bash
docs: resolve merge conflicts in docker-compose.yml

Conflicts resolved:
- Kept production resource limits from develop
- Merged new health check config from feature
- Preserved network isolation from both branches
```

---

## Gestion des conflits dans les Pull Requests

### Prévention des conflits

1. **Mettre à jour régulièrement avec develop**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout feature/votre-feature
   git rebase develop  # ou merge selon la politique
   ```

2. **Communiquer avec l'équipe**
   - Informer si vous travaillez sur des fichiers partagés
   - Coordonner les changements majeurs

### Résolution des conflits

Voir la section [Résolution de conflits](#résolution-de-conflits) ci-dessus.

---

## Ressources

- [GitFlow Workflow (Atlassian)](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Pro Git Book (Français)](https://git-scm.com/book/fr/v2)
- [GitHub Flow](https://guides.github.com/introduction/flow/)

---

**Dernière mise à jour** : 2025-01-09
