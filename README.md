# Scraper Dashboard

Dashboard de monitoring pour les scrapers immobiliers — **Laravel API** + **Nuxt 3 frontend**.

## Stack

| Layer    | Technologie              |
|----------|--------------------------|
| Backend  | Laravel 11 (API-only)    |
| Frontend | Nuxt 3 + Tailwind CSS    |
| Data     | MongoDB (lecture seule)  |
| Infra    | Docker + Docker Compose  |

## Fonctionnalités

- **Vue globale** : total annonces brutes / nettoyées / rejetées, pays couverts, scrapers actifs
- **Par pays** : sections Canada, France, Tunisie, Égypte avec leurs scrapers
- **Par scraper** : compteurs raw/clean, taux de nettoyage, stats de prix, types de propriété, villes top 10
- **Contrôle Docker** : Start / Stop / Restart de chaque scraper via l'API
- **Logs** : affichage des derniers logs de chaque container
- **Auto-refresh** : toutes les 30 secondes (toggle)

## Installation rapide

```bash
cd scraper-dashboard
cp .env.example .env
# Éditer .env (MONGODB_URI, SCRAPERS_HOST_PATH, APP_KEY)

docker-compose up -d --build
```

- Frontend : http://localhost:3000
- API      : http://localhost:8000/api/stats

## Développement local

```bash
# Backend
cd backend
composer install
cp .env.example .env && php artisan key:generate
php artisan serve

# Frontend
cd frontend
npm install
npm run dev
```

## API Endpoints

| Méthode | Route                           | Description                  |
|---------|---------------------------------|------------------------------|
| GET     | `/api/stats`                    | Stats globales + par scraper |
| POST    | `/api/scrapers/{key}/start`     | Démarrer un scraper          |
| POST    | `/api/scrapers/{key}/stop`      | Arrêter un scraper           |
| POST    | `/api/scrapers/{key}/restart`   | Redémarrer un scraper        |
| GET     | `/api/scrapers/{key}/logs`      | Logs du container            |

Keys disponibles : `centris`, `mktlist`, `bienici`, `mubawab`, `propertyfinder`

## Note sur les contrôles Docker

Le container `dashboard-backend` a besoin d'accéder au socket Docker de l'hôte (`/var/run/docker.sock`) pour contrôler les scrapers. Vérifie que le docker-compose monte bien ce socket.
