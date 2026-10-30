# Déploiement

L'API tourne sur Render, le client sur Vercel, la base sur Neon. Le navigateur ne parle qu'au domaine du client : Vercel réécrit `/api/*` vers l'API, donc pas de CORS et des cookies `sameSite`.

## L'API sur Render

`render.yaml` décrit le service, construit depuis `server/Dockerfile.prod`. Au démarrage, `prisma migrate deploy` applique les migrations puis le serveur écoute sur le port 3000.

Après le premier déploiement, reportez l'adresse attribuée par Render dans la variable `API_URL` du projet Vercel (voir plus bas) et vérifiez `CLIENT_URL`.

Variables à renseigner dans le tableau de bord :

| Variable                                                 | Où la trouver                                                                                                                                                                                                  |
| -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`                                           | chaîne de connexion Neon avec `?sslmode=require`. L’API passe par le pooler ; pour les migrations, Prisma retire `-pooler` de l’hôte et se connecte en direct, car le pooler ne tient pas le verrou de session |
| `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` | `npx web-push generate-vapid-keys`, facultatif                                                                                                                                                                 |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD`                          | le compte administrateur créé au premier démarrage                                                                                                                                                             |
| `BREVO_API_KEY`, `MAIL_FROM`                             | la clé API Brevo (SMTP & API, onglet Clés API) et une adresse validée chez Brevo. Les services gratuits de Render bloquent les ports SMTP 25, 465 et 587 : les emails passent donc par l’API HTTPS de Brevo    |

`JWT_SECRET` est généré par Render. Au démarrage, après les migrations, le seed charge le catalogue s’il est absent et crée l’administrateur défini par `ADMIN_EMAIL` et `ADMIN_PASSWORD` ; aucun compte de démonstration n’est créé en production.

L'offre gratuite de Render endort le service après quinze minutes sans trafic : une sonde externe sur `/health` toutes les quatorze minutes l'évite. `/health` ne touche pas la base, et les rappels push ne l'interrogent qu'à leur échéance : la base Neon peut ainsi se mettre en veille et rester dans le quota gratuit.

## Le client sur Vercel

Le projet Vercel a pour dossier racine `client` (préréglage de framework `Other`). `client/vercel.json` porte l'installation des dépendances à la racine du monorepo, le build avec `VITE_API_URL=/api`, le dossier publié, la réécriture des routes de l'application et les en-têtes de cache.

`client/middleware.ts` réécrit `/api/*` vers l'API dont l'adresse est lue dans la variable `API_URL` du projet Vercel (par exemple `https://linguago-api-s9fz.onrender.com`). L'adresse de l'API n'apparaît ainsi ni dans le navigateur, ni dans le bundle, ni dans le dépôt. Si elle change, modifiez `API_URL` dans Settings → Environment Variables puis redéployez ; sans elle, `/api/*` répond 502.

Le service worker est servi avec `Cache-Control: no-cache` pour que les mises à jour soient détectées à chaque visite ; l'application propose alors de recharger.

## En local avec Docker

`docker compose up -d` est l'environnement de développement : PostgreSQL sur le port 5435 (pour ne pas gêner une autre instance), pgAdmin sur http://localhost:5051, l'API dans un conteneur `node:24-slim` avec `nest start --watch` et le client avec Vite. `server/src`, `server/prisma`, `client/src` et `client/public` sont montés depuis le dépôt : une modification recompile l'API ou met à jour le navigateur à chaud. TypeScript et Vite surveillent les fichiers par sondage (`TSC_WATCHFILE`, `VITE_USE_POLLING`), car les événements du système de fichiers ne traversent pas un montage Docker Desktop ; l'image de l'API embarque `procps`, dont `nest --watch` a besoin pour arrêter l'ancien processus avant de relancer. Vite joint l'API par le réseau Compose (`API_URL=http://server:3000`). Les dépendances sont installées dans les images : après un changement de `package.json`, `docker compose up -d --build`.

## Auto-hébergement

`docker compose -f docker-compose.prod.yml up -d --build` construit les images de production : `server/Dockerfile.prod` (la même que sur Render, utilisateur non root, dépendances de production seules) et `client/Dockerfile.prod` (build Vite avec `VITE_API_URL=/api`, servi par nginx). nginx réécrit `/api/*` vers `server:3000`, ce qui reproduit la réécriture Vercel : une seule origine, pas de CORS. Le service worker et le manifeste sont servis sans cache, les fichiers de `assets/` avec un cache d'un an. Le serveur applique les migrations et le seed au démarrage. La base n'est pas exposée sur l'hôte ; seul le client l'est, sur le port `WEB_PORT` (8080 par défaut).

Variables obligatoires, le démarrage échoue sans elles : `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`, `JWT_SECRET`, `CLIENT_URL` (l'adresse publique du client). Les facultatives sont les mêmes qu'ailleurs : `COOKIE_DOMAIN`, `SMTP_*`, `VAPID_*`, `GOOGLE_*`.

L'intégration continue construit les deux images de production à chaque poussée.
