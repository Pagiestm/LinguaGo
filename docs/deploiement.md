# Déploiement

L'API tourne sur Render, le client sur Vercel, la base sur Neon. Le navigateur ne parle qu'au domaine du client : Vercel réécrit `/api/*` vers l'API, donc pas de CORS et des cookies `sameSite`.

## L'API sur Render

`render.yaml` décrit le service, construit depuis `server/Dockerfile.prod`. Au démarrage, `prisma migrate deploy` applique les migrations puis le serveur écoute sur le port 3000.

Après le premier déploiement, reportez l'adresse attribuée par Render dans `vercel.json` (cible de la réécriture) et vérifiez `CLIENT_URL`.

Variables à renseigner dans le tableau de bord :

| Variable                                                 | Où la trouver                                     |
| -------------------------------------------------------- | ------------------------------------------------- |
| `DATABASE_URL`                                           | chaîne de connexion Neon, avec `?sslmode=require` |
| `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` | `npx web-push generate-vapid-keys`, facultatif    |

`JWT_SECRET` est généré par Render. Le seed se lance une fois depuis un poste avec `DATABASE_URL` pointant sur Neon : `npm run seed -w server`.

L'offre gratuite de Render endort le service après quinze minutes sans trafic : une sonde externe sur `/health` toutes les dix minutes l'évite.

## Le client sur Vercel

`vercel.json` porte tout : installation, build avec `VITE_API_URL=/api`, dossier publié, réécritures et en-têtes de cache. Le dossier racine du projet Vercel est la racine du dépôt, le préréglage de framework est `Other`.

Le service worker est servi avec `Cache-Control: no-cache` pour que les mises à jour soient détectées à chaque visite ; l'application propose alors de recharger.

## En local avec Docker

`docker compose up -d` est l'environnement de développement : PostgreSQL sur le port 5435 (pour ne pas gêner une autre instance), pgAdmin sur http://localhost:5051, l'API dans un conteneur `node:24-slim` avec `nest start --watch` et le client avec Vite. `server/src`, `server/prisma`, `client/src` et `client/public` sont montés depuis le dépôt : une modification recompile l'API ou met à jour le navigateur à chaud. TypeScript et Vite surveillent les fichiers par sondage (`TSC_WATCHFILE`, `VITE_USE_POLLING`), car les événements du système de fichiers ne traversent pas un montage Docker Desktop ; l'image de l'API embarque `procps`, dont `nest --watch` a besoin pour arrêter l'ancien processus avant de relancer. Vite joint l'API par le réseau Compose (`VITE_PROXY_TARGET=http://server:3000`). Les dépendances sont installées dans les images : après un changement de `package.json`, `docker compose up -d --build`.

## Auto-hébergement

`docker compose -f docker-compose.prod.yml up -d --build` construit les images de production : `server/Dockerfile.prod` (la même que sur Render, utilisateur non root, dépendances de production seules) et `client/Dockerfile.prod` (build Vite avec `VITE_API_URL=/api`, servi par nginx). nginx réécrit `/api/*` vers `server:3000`, ce qui reproduit la réécriture Vercel : une seule origine, pas de CORS. Le service worker et le manifeste sont servis sans cache, les fichiers de `assets/` avec un cache d'un an. Le serveur applique les migrations et le seed au démarrage. La base n'est pas exposée sur l'hôte ; seul le client l'est, sur le port `WEB_PORT` (8080 par défaut).

Variables obligatoires, le démarrage échoue sans elles : `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`, `JWT_SECRET`, `CLIENT_URL` (l'adresse publique du client). Les facultatives sont les mêmes qu'ailleurs : `COOKIE_DOMAIN`, `SMTP_*`, `VAPID_*`, `GOOGLE_*`.

L'intégration continue construit les deux images de production à chaque poussée.
